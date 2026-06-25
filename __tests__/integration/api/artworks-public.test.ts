import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }))

const mockFindFirst = vi.fn()
vi.mock('@/lib/db', () => ({
  db: { artwork: { findFirst: (...args: unknown[]) => mockFindFirst(...args) } },
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

type Params = { params: Promise<{ id: string }> }

function makeCtx(id = 'aw-1'): Params {
  return { params: Promise.resolve({ id }) }
}

function makeArtwork(overrides = {}) {
  return {
    id:             'aw-1',
    title:          'Obra de prueba',
    type:           'PAINTING',
    status:         'EXPOSED',
    year:           2024,
    viewCount:      5,
    assetThumbnail: 'https://cdn.test/thumb.webp',
    assetGallery:   'https://cdn.test/gallery.webp',
    artist: { id: 'artist-1', name: 'Test Artist', bio: null, avatarUrl: null },
    slot:   { gallery: { id: 'g-1', name: 'Mi galería', slug: 'mi-galeria' } },
    ...overrides,
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('GET /api/artworks/[id]/public', () => {
  let GET: (_req: Request, ctx: Params) => Promise<Response>

  beforeEach(async () => {
    vi.clearAllMocks()
    const mod = await import('@/app/api/artworks/[id]/public/route')
    GET = mod.GET
  })

  it('devuelve 404 si la obra no existe o no está expuesta en una galería pública', async () => {
    mockFindFirst.mockResolvedValue(null)

    const req = new Request('http://localhost/api/artworks/aw-99/public')
    const res = await GET(req, makeCtx('aw-99'))
    const body = await res.json() as { error: string }

    expect(res.status).toBe(404)
    expect(body.error).toBe('Not found')
  })

  it('devuelve 200 con los datos completos de la obra', async () => {
    const artwork = makeArtwork()
    mockFindFirst.mockResolvedValue(artwork)

    const req = new Request('http://localhost/api/artworks/aw-1/public')
    const res = await GET(req, makeCtx('aw-1'))
    const body = await res.json() as typeof artwork

    expect(res.status).toBe(200)
    expect(body.id).toBe('aw-1')
    expect(body.title).toBe('Obra de prueba')
    expect(body.artist.name).toBe('Test Artist')
    expect(body.slot?.gallery.slug).toBe('mi-galeria')
  })

  it('consulta solo obras EXPOSED en galería PUBLIC', async () => {
    mockFindFirst.mockResolvedValue(null)

    const req = new Request('http://localhost/api/artworks/aw-1/public')
    await GET(req, makeCtx('aw-1'))

    expect(mockFindFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        status: 'EXPOSED',
        slot:   expect.objectContaining({
          gallery: expect.objectContaining({ visibility: 'PUBLIC' }),
        }),
      }),
    }))
  })
})
