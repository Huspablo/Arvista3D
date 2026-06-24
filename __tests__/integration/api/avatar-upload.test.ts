import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }))

const mockRequireArtist = vi.fn()
vi.mock('@/lib/api-helpers', () => ({
  requireArtist: (...args: unknown[]) => mockRequireArtist(...args),
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeArtist(overrides = {}) {
  return { id: 'artist-1', plan: 'BASIC', ...overrides }
}

async function makeFormRequest(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return new Request('http://localhost/api/assets/avatar-upload', {
    method: 'POST',
    body:   formData,
  })
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('POST /api/assets/avatar-upload', () => {
  let POST: (req: Request) => Promise<Response>

  beforeEach(async () => {
    vi.clearAllMocks()
    const mod = await import('@/app/api/assets/avatar-upload/route')
    POST = mod.POST
  })

  it('devuelve 401 si no hay sesión autenticada', async () => {
    mockRequireArtist.mockResolvedValue({
      artist: null,
      error:  NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    })
    const file = new File(['data'], 'avatar.jpg', { type: 'image/jpeg' })
    const res  = await POST(await makeFormRequest(file))
    expect(res.status).toBe(401)
  })

  it('devuelve 400 si no se envía ningún archivo', async () => {
    mockRequireArtist.mockResolvedValue({ artist: makeArtist(), error: null })
    const req  = new Request('http://localhost/api/assets/avatar-upload', {
      method: 'POST',
      body:   new FormData(),
    })
    const res  = await POST(req)
    const body = await res.json() as { error: string }
    expect(res.status).toBe(400)
    expect(body.error).toContain('archivo')
  })

  it('devuelve 400 si el tipo no está permitido', async () => {
    mockRequireArtist.mockResolvedValue({ artist: makeArtist(), error: null })
    const file = new File(['data'], 'doc.pdf', { type: 'application/pdf' })
    const res  = await POST(await makeFormRequest(file))
    const body = await res.json() as { error: string }
    expect(res.status).toBe(400)
    expect(body.error).toContain('Formato')
  })

  it('sube PNG a R2 y devuelve cdnUrl con la clave correcta', async () => {
    mockRequireArtist.mockResolvedValue({ artist: makeArtist(), error: null })
    mockR2Send.mockResolvedValue({})

    const file = new File(['img'], 'photo.png', { type: 'image/png' })
    const res  = await POST(await makeFormRequest(file))
    const body = await res.json() as { cdnUrl: string }

    expect(res.status).toBe(200)
    expect(body.cdnUrl).toMatch(/^https:\/\/cdn\.test\/avatars\/artist-1\/\d+\.png$/)
    expect(mockR2Send).toHaveBeenCalledOnce()
  })

  it('sube JPEG a R2 correctamente', async () => {
    mockRequireArtist.mockResolvedValue({ artist: makeArtist(), error: null })
    mockR2Send.mockResolvedValue({})

    const file = new File(['img'], 'portrait.jpg', { type: 'image/jpeg' })
    const res  = await POST(await makeFormRequest(file))
    const body = await res.json() as { cdnUrl: string }

    expect(res.status).toBe(200)
    expect(body.cdnUrl).toMatch(/\.jpg$/)
  })

  it('devuelve 400 si el archivo supera 5 MB', async () => {
    mockRequireArtist.mockResolvedValue({ artist: makeArtist(), error: null })

    // Simula un fichero de 6 MB
    const big  = new Uint8Array(6 * 1024 * 1024).fill(1)
    const file = new File([big], 'huge.jpg', { type: 'image/jpeg' })
    const res  = await POST(await makeFormRequest(file))
    const body = await res.json() as { error: string }

    expect(res.status).toBe(400)
    expect(body.error).toContain('5 MB')
  })
})
