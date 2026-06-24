import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('next/cache', () => ({ revalidateTag: vi.fn() }))
vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }))

// Mock de requireArtist controlable por cada test
const mockRequireArtist = vi.fn()
vi.mock('@/lib/api-helpers', () => ({
  requireArtist:        (...args: unknown[]) => mockRequireArtist(...args),
  serviceErrorToResponse: vi.fn().mockImplementation((err: unknown) => {
    const msg = err instanceof Error ? err.message : ''
    if (msg.startsWith('FORBIDDEN'))        return NextResponse.json({ error: msg }, { status: 403 })
    if (msg.startsWith('CAPACITY_REACHED')) return NextResponse.json({ error: msg }, { status: 403 })
    if (msg.startsWith('NO_SLOT'))          return NextResponse.json({ error: msg }, { status: 409 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }),
}))

const mockCreateArtwork  = vi.fn()
const mockListArtworks   = vi.fn()
const mockPublishArtwork = vi.fn()

vi.mock('@/lib/services/artwork.service', () => ({
  createArtwork:        (...args: unknown[]) => mockCreateArtwork(...args),
  listArtworksByArtist: (...args: unknown[]) => mockListArtworks(...args),
  publishArtwork:       (...args: unknown[]) => mockPublishArtwork(...args),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeArtist(overrides = {}) {
  return { id: 'artist-1', plan: 'BASIC', ...overrides }
}

function makeRequest(body: unknown, method = 'POST') {
  return new Request('http://localhost/api/artworks', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })
}

// ── POST /api/artworks ────────────────────────────────────────────────────────

describe('POST /api/artworks', () => {
  // Importamos el handler dinámicamente para que los mocks estén activos
  let POST: (req: Request) => Promise<Response>

  beforeEach(async () => {
    vi.clearAllMocks()
    const mod = await import('@/app/api/artworks/route')
    POST = mod.POST
  })

  it('devuelve 401 si no hay sesión', async () => {
    mockRequireArtist.mockResolvedValue({ artist: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) })

    const res = await POST(makeRequest({ title: 'Test', type: 'PAINTING' }))
    expect(res.status).toBe(401)
  })

  it('devuelve 400 si falta el título', async () => {
    mockRequireArtist.mockResolvedValue({ artist: makeArtist(), error: null })

    const res  = await POST(makeRequest({ type: 'PAINTING' }))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toHaveProperty('title')
  })

  it('devuelve 400 si el tipo es inválido', async () => {
    mockRequireArtist.mockResolvedValue({ artist: makeArtist(), error: null })

    const res  = await POST(makeRequest({ title: 'Test', type: 'CUADRO' }))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toHaveProperty('type')
  })

  it('devuelve 201 con datos válidos', async () => {
    const artwork = { id: 'aw-1', title: 'Test', type: 'PAINTING' }
    mockRequireArtist.mockResolvedValue({ artist: makeArtist(), error: null })
    mockCreateArtwork.mockResolvedValue(artwork)

    const res  = await POST(makeRequest({ title: 'Test', type: 'PAINTING' }))
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.id).toBe('aw-1')
    expect(mockCreateArtwork).toHaveBeenCalledWith('artist-1', expect.objectContaining({ title: 'Test', type: 'PAINTING' }))
  })
})

// ── POST /api/artworks/[id]/publish ──────────────────────────────────────────

describe('POST /api/artworks/[id]/publish', () => {
  let POST: (req: Request, ctx: { params: Promise<{ id: string }> }) => Promise<Response>

  beforeEach(async () => {
    vi.clearAllMocks()
    const mod = await import('@/app/api/artworks/[id]/publish/route')
    POST = mod.POST
  })

  function makeParams(id = 'aw-1') {
    return { params: Promise.resolve({ id }) }
  }

  it('devuelve 400 si falta galleryId', async () => {
    mockRequireArtist.mockResolvedValue({ artist: makeArtist(), error: null })

    const res  = await POST(makeRequest({}), makeParams())
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toHaveProperty('galleryId')
  })

  it('devuelve 403 si la obra no pertenece al artista', async () => {
    mockRequireArtist.mockResolvedValue({ artist: makeArtist(), error: null })
    mockPublishArtwork.mockRejectedValue(new Error('FORBIDDEN: sin permisos'))

    const res = await POST(makeRequest({ galleryId: 'g-1' }), makeParams())
    expect(res.status).toBe(403)
  })

  it('devuelve 409 si no hay slot disponible', async () => {
    mockRequireArtist.mockResolvedValue({ artist: makeArtist(), error: null })
    mockPublishArtwork.mockRejectedValue(new Error('NO_SLOT_AVAILABLE: sin posición'))

    const res = await POST(makeRequest({ galleryId: 'g-1' }), makeParams())
    expect(res.status).toBe(409)
  })

  it('devuelve 200 con la obra expuesta', async () => {
    const exposed = { id: 'aw-1', status: 'EXPOSED' }
    mockRequireArtist.mockResolvedValue({ artist: makeArtist(), error: null })
    mockPublishArtwork.mockResolvedValue(exposed)

    const res  = await POST(makeRequest({ galleryId: 'g-1' }), makeParams())
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.status).toBe('EXPOSED')
  })
})
