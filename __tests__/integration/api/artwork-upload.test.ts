import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }))

const mockRequireArtist = vi.fn()
vi.mock('@/lib/api-helpers', () => ({
  requireArtist:          (...args: unknown[]) => mockRequireArtist(...args),
  serviceErrorToResponse: vi.fn().mockImplementation(() =>
    NextResponse.json({ error: 'Error interno' }, { status: 500 }),
  ),
}))

const mockR2Send = vi.fn()
vi.mock('@/lib/r2', () => ({
  r2:        { send: (...args: unknown[]) => mockR2Send(...args) },
  R2_BUCKET: 'test-bucket',
  cdnUrl:    (key: string) => `https://cdn.test/${key}`,
}))

// Mock de db.artwork.findFirst y db.artwork.update
const mockArtworkFindFirst = vi.fn()
const mockArtworkUpdate    = vi.fn()
vi.mock('@/lib/db', () => ({
  db: {
    artwork: {
      findFirst: (...args: unknown[]) => mockArtworkFindFirst(...args),
      update:    (...args: unknown[]) => mockArtworkUpdate(...args),
    },
  },
}))

// Mock de inngest.send — no queremos disparar eventos reales en tests
const mockInngestSend = vi.fn()
vi.mock('@/lib/inngest', () => ({
  inngest: { send: (...args: unknown[]) => mockInngestSend(...args) },
}))

// Mock de sharp — la ruta genera una miniatura síncrona; en tests usamos un buffer falso
vi.mock('sharp', () => ({
  default: vi.fn().mockReturnValue({
    resize:   vi.fn().mockReturnThis(),
    webp:     vi.fn().mockReturnThis(),
    toBuffer: vi.fn().mockResolvedValue(Buffer.from('fake-webp')),
  }),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeArtist(overrides = {}) {
  return { id: 'artist-1', plan: 'BASIC', ...overrides }
}

function makeArtwork(overrides = {}) {
  return { id: 'aw-1', artistId: 'artist-1', title: 'Test', ...overrides }
}

async function makeFormRequest(file: File, artworkId = 'aw-1') {
  const formData = new FormData()
  formData.append('file',      file)
  formData.append('artworkId', artworkId)
  return new Request('http://localhost/api/assets/artwork-upload', {
    method: 'POST',
    body:   formData,
  })
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('POST /api/assets/artwork-upload', () => {
  let POST: (req: Request) => Promise<Response>

  beforeEach(async () => {
    vi.clearAllMocks()
    const mod = await import('@/app/api/assets/artwork-upload/route')
    POST = mod.POST
  })

  it('devuelve 401 si no hay sesión autenticada', async () => {
    mockRequireArtist.mockResolvedValue({
      artist: null,
      error:  NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    })
    const file = new File(['data'], 'obra.jpg', { type: 'image/jpeg' })
    const res  = await POST(await makeFormRequest(file))
    expect(res.status).toBe(401)
  })

  it('devuelve 400 si no se envía ningún archivo', async () => {
    mockRequireArtist.mockResolvedValue({ artist: makeArtist(), error: null })
    const fd  = new FormData()
    fd.append('artworkId', 'aw-1')
    const req = new Request('http://localhost/api/assets/artwork-upload', { method: 'POST', body: fd })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json() as { error: string }
    expect(body.error).toContain('archivo')
  })

  it('devuelve 400 si falta el artworkId', async () => {
    mockRequireArtist.mockResolvedValue({ artist: makeArtist(), error: null })
    const fd  = new FormData()
    fd.append('file', new File(['data'], 'obra.jpg', { type: 'image/jpeg' }))
    const req = new Request('http://localhost/api/assets/artwork-upload', { method: 'POST', body: fd })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json() as { error: string }
    expect(body.error).toContain('identificador')
  })

  it('devuelve 400 si el tipo de archivo no está permitido', async () => {
    mockRequireArtist.mockResolvedValue({ artist: makeArtist(), error: null })
    const file = new File(['data'], 'doc.pdf', { type: 'application/pdf' })
    const res  = await POST(await makeFormRequest(file))
    expect(res.status).toBe(400)
    const body = await res.json() as { error: string }
    expect(body.error).toContain('Formato')
  })

  it('devuelve 400 si el archivo supera 20 MB', async () => {
    mockRequireArtist.mockResolvedValue({ artist: makeArtist(), error: null })
    const big  = new Uint8Array(21 * 1024 * 1024).fill(1)
    const file = new File([big], 'huge.jpg', { type: 'image/jpeg' })
    const res  = await POST(await makeFormRequest(file))
    expect(res.status).toBe(400)
    const body = await res.json() as { error: string }
    expect(body.error).toContain('20 MB')
  })

  it('devuelve 403 si la obra no pertenece al artista', async () => {
    mockRequireArtist.mockResolvedValue({ artist: makeArtist(), error: null })
    mockArtworkFindFirst.mockResolvedValue(null) // obra no encontrada
    const file = new File(['data'], 'obra.png', { type: 'image/png' })
    const res  = await POST(await makeFormRequest(file))
    expect(res.status).toBe(403)
  })

  it('sube original y miniatura a R2, actualiza BD con thumbnail y dispara Inngest — devuelve 200', async () => {
    mockRequireArtist.mockResolvedValue({ artist: makeArtist(), error: null })
    mockArtworkFindFirst.mockResolvedValue(makeArtwork())
    mockR2Send.mockResolvedValue({})
    mockArtworkUpdate.mockResolvedValue({})
    mockInngestSend.mockResolvedValue({})

    const file = new File(['imgdata'], 'pintura.png', { type: 'image/png' })
    const res  = await POST(await makeFormRequest(file))
    const body = await res.json() as { key: string; thumbnailUrl: string; ok: boolean }

    expect(res.status).toBe(200)
    expect(body.ok).toBe(true)
    expect(body.key).toMatch(/^artworks\/aw-1\/original\/\d+\.png$/)
    // Dos llamadas a R2: una para el original, otra para la miniatura
    expect(mockR2Send).toHaveBeenCalledTimes(2)
    // La BD se actualiza con originalKey Y thumbnailUrl
    expect(mockArtworkUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'aw-1' },
        data:  expect.objectContaining({
          assetOriginalKey: expect.stringMatching(/^artworks\/aw-1\/original\/\d+\.png$/),
          assetThumbnail:   'https://cdn.test/artworks/aw-1/thumbnail.webp',
        }),
      }),
    )
    expect(mockInngestSend).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'artwork/uploaded' }),
    )
  })

  it('devuelve 200 aunque Inngest falle — miniatura ya fue guardada', async () => {
    mockRequireArtist.mockResolvedValue({ artist: makeArtist(), error: null })
    mockArtworkFindFirst.mockResolvedValue(makeArtwork())
    mockR2Send.mockResolvedValue({})
    mockArtworkUpdate.mockResolvedValue({})
    mockInngestSend.mockRejectedValue(new Error('Inngest not running'))

    const file = new File(['imgdata'], 'pintura.png', { type: 'image/png' })
    const res  = await POST(await makeFormRequest(file))
    const body = await res.json() as { ok: boolean }

    expect(res.status).toBe(200)
    expect(body.ok).toBe(true)
  })

  it('sube correctamente archivos JPEG', async () => {
    mockRequireArtist.mockResolvedValue({ artist: makeArtist(), error: null })
    mockArtworkFindFirst.mockResolvedValue(makeArtwork())
    mockR2Send.mockResolvedValue({})
    mockArtworkUpdate.mockResolvedValue({})
    mockInngestSend.mockResolvedValue({})

    const file = new File(['imgdata'], 'retrato.jpg', { type: 'image/jpeg' })
    const res  = await POST(await makeFormRequest(file))
    const body = await res.json() as { key: string }

    expect(res.status).toBe(200)
    expect(body.key).toMatch(/\.jpg$/)
  })
})
