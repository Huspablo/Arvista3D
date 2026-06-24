import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('next/cache', () => ({ revalidateTag: vi.fn() }))
vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }))

const mockRequireArtist = vi.fn()
vi.mock('@/lib/api-helpers', () => ({
  requireArtist: (...args: unknown[]) => mockRequireArtist(...args),
  serviceErrorToResponse: vi.fn().mockImplementation((err: unknown) => {
    const msg = err instanceof Error ? err.message : ''
    if (msg.startsWith('FORBIDDEN')) return NextResponse.json({ error: msg }, { status: 403 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }),
}))

const mockListArtworks  = vi.fn()
const mockCreateArtwork = vi.fn()
const mockDeleteArtwork = vi.fn()
const mockUpdateArtwork = vi.fn()

vi.mock('@/lib/services/artwork.service', () => ({
  listArtworksByArtist: (...args: unknown[]) => mockListArtworks(...args),
  createArtwork:        (...args: unknown[]) => mockCreateArtwork(...args),
  deleteArtwork:        (...args: unknown[]) => mockDeleteArtwork(...args),
  updateArtwork:        (...args: unknown[]) => mockUpdateArtwork(...args),
  publishArtwork:       vi.fn(),
  unpublishArtwork:     vi.fn(),
}))

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeArtist(overrides = {}) {
  return { id: 'artist-1', plan: 'BASIC', ...overrides }
}

function makeArtwork(overrides = {}) {
  return {
    id: 'aw-1', title: 'Test', type: 'PAINTING',
    status: 'DRAFT', artistId: 'artist-1',
    year: 2024, assetThumbnail: null,
    ...overrides,
  }
}

// ── GET /api/artworks ─────────────────────────────────────────────────────────

describe('GET /api/artworks — listado del artista', () => {
  let GET: () => Promise<Response>

  beforeEach(async () => {
    vi.clearAllMocks()
    const mod = await import('@/app/api/artworks/route')
    GET = mod.GET
  })

  it('devuelve 401 si no hay sesión', async () => {
    mockRequireArtist.mockResolvedValue({
      artist: null,
      error:  NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    })
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('devuelve array vacío si el artista no tiene obras (primer uso, sin mensaje de límite)', async () => {
    mockRequireArtist.mockResolvedValue({ artist: makeArtist(), error: null })
    mockListArtworks.mockResolvedValue([])

    const res  = await GET()
    const body = await res.json() as unknown[]

    expect(res.status).toBe(200)
    // Con 0 obras nunca puede haber conflicto con límite de plan
    expect(body).toEqual([])
    expect(body).toHaveLength(0)
  })

  it('devuelve las obras del artista con todos sus campos', async () => {
    const artworks = [
      makeArtwork(),
      makeArtwork({ id: 'aw-2', title: 'Escultura A', type: 'SCULPTURE', status: 'EXPOSED' }),
    ]
    mockRequireArtist.mockResolvedValue({ artist: makeArtist(), error: null })
    mockListArtworks.mockResolvedValue(artworks)

    const res  = await GET()
    const body = await res.json() as typeof artworks

    expect(res.status).toBe(200)
    expect(body).toHaveLength(2)
    expect(body[0].title).toBe('Test')
    expect(body[1].status).toBe('EXPOSED')
    expect(mockListArtworks).toHaveBeenCalledWith('artist-1')
  })

  it('solo devuelve obras del artista autenticado, no de otros', async () => {
    const myArtworks = [makeArtwork()]
    mockRequireArtist.mockResolvedValue({ artist: makeArtist(), error: null })
    mockListArtworks.mockResolvedValue(myArtworks)

    const res  = await GET()
    const body = await res.json() as typeof myArtworks

    expect(res.status).toBe(200)
    expect(body.every(a => a.artistId === 'artist-1')).toBe(true)
    expect(mockListArtworks).toHaveBeenCalledWith('artist-1')
    expect(mockListArtworks).not.toHaveBeenCalledWith('artist-2')
  })
})

// ── DELETE /api/artworks/[id] ─────────────────────────────────────────────────

describe('DELETE /api/artworks/[id] — borrado con modal', () => {
  let DELETE: (req: Request, ctx: { params: Promise<{ id: string }> }) => Promise<Response>

  beforeEach(async () => {
    vi.clearAllMocks()
    const mod = await import('@/app/api/artworks/[id]/route')
    DELETE = mod.DELETE
  })

  function makeCtx(id = 'aw-1') {
    return { params: Promise.resolve({ id }) }
  }

  function makeDeleteReq(id = 'aw-1') {
    return new Request(`http://localhost/api/artworks/${id}`, { method: 'DELETE' })
  }

  it('devuelve 401 si no hay sesión', async () => {
    mockRequireArtist.mockResolvedValue({
      artist: null,
      error:  NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    })
    const res = await DELETE(makeDeleteReq(), makeCtx())
    expect(res.status).toBe(401)
  })

  it('devuelve 403 si la obra no pertenece al artista', async () => {
    mockRequireArtist.mockResolvedValue({ artist: makeArtist(), error: null })
    mockDeleteArtwork.mockRejectedValue(new Error('FORBIDDEN: obra de otro artista'))

    const res = await DELETE(makeDeleteReq(), makeCtx())
    expect(res.status).toBe(403)
  })

  it('devuelve 204 al eliminar correctamente — sin body', async () => {
    mockRequireArtist.mockResolvedValue({ artist: makeArtist(), error: null })
    mockDeleteArtwork.mockResolvedValue(undefined)

    const res = await DELETE(makeDeleteReq(), makeCtx())
    expect(res.status).toBe(204)
    expect(mockDeleteArtwork).toHaveBeenCalledWith('aw-1', 'artist-1')
  })

  it('llama al servicio con el id correcto del parámetro de ruta', async () => {
    mockRequireArtist.mockResolvedValue({ artist: makeArtist(), error: null })
    mockDeleteArtwork.mockResolvedValue(undefined)

    await DELETE(makeDeleteReq('aw-99'), makeCtx('aw-99'))
    expect(mockDeleteArtwork).toHaveBeenCalledWith('aw-99', 'artist-1')
  })
})

// ── Lógica de filtros del dashboard ──────────────────────────────────────────

describe('Lógica de filtros del dashboard de obras', () => {
  // Extraemos la misma lógica que usa ArtworksList para verificarla de forma aislada

  type ArtworkType = 'PAINTING' | 'SCULPTURE' | 'PHOTOGRAPHY' | 'OTHER'
  type ArtworkStatus = 'EXPOSED' | 'DRAFT'

  const TYPE_MAP: Record<string, ArtworkType> = {
    Pintura: 'PAINTING', Escultura: 'SCULPTURE', Fotografía: 'PHOTOGRAPHY', Otro: 'OTHER',
  }

  function filterArtworks(
    artworks: { title: string; type: ArtworkType; status: ArtworkStatus }[],
    typeFilter: string,
    statusFilter: string,
    search: string,
  ) {
    return artworks.filter(a => {
      if (typeFilter !== 'Todas' && a.type !== TYPE_MAP[typeFilter]) return false
      if (statusFilter === 'Expuestas'   && a.status !== 'EXPOSED') return false
      if (statusFilter === 'Sin exponer' && a.status !== 'DRAFT')   return false
      if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }

  const artworks = [
    { title: 'Pintura A', type: 'PAINTING'    as const, status: 'EXPOSED' as const },
    { title: 'Pintura B', type: 'PAINTING'    as const, status: 'DRAFT'   as const },
    { title: 'Escultura', type: 'SCULPTURE'   as const, status: 'EXPOSED' as const },
    { title: 'Foto',      type: 'PHOTOGRAPHY' as const, status: 'DRAFT'   as const },
  ]

  it('sin filtros devuelve todas las obras', () => {
    const result = filterArtworks(artworks, 'Todas', 'Todas', '')
    expect(result).toHaveLength(4)
  })

  it('filtrar por tipo Pintura devuelve 2 obras', () => {
    const result = filterArtworks(artworks, 'Pintura', 'Todas', '')
    expect(result).toHaveLength(2)
    expect(result.every(a => a.type === 'PAINTING')).toBe(true)
  })

  it('filtrar por Expuestas devuelve solo obras EXPOSED', () => {
    const result = filterArtworks(artworks, 'Todas', 'Expuestas', '')
    expect(result).toHaveLength(2)
    expect(result.every(a => a.status === 'EXPOSED')).toBe(true)
  })

  it('filtrar por Sin exponer devuelve solo obras DRAFT', () => {
    const result = filterArtworks(artworks, 'Todas', 'Sin exponer', '')
    expect(result).toHaveLength(2)
    expect(result.every(a => a.status === 'DRAFT')).toBe(true)
  })

  it('búsqueda por texto es case-insensitive', () => {
    const result = filterArtworks(artworks, 'Todas', 'Todas', 'pintura')
    expect(result).toHaveLength(2)
  })

  it('filtros combinados no eliminan obras existentes erróneamente', () => {
    const result = filterArtworks(artworks, 'Pintura', 'Expuestas', '')
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Pintura A')
  })

  it('filtro sin resultados devuelve array vacío (no undefined)', () => {
    const result = filterArtworks(artworks, 'Pintura', 'Todas', 'Escultura')
    expect(result).toEqual([])
  })
})
