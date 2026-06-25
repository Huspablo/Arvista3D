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
    if (msg.startsWith('FORBIDDEN'))        return NextResponse.json({ error: msg }, { status: 403 })
    if (msg.startsWith('GALLERY_NOT_FOUND')) return NextResponse.json({ error: msg }, { status: 404 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }),
}))

const mockUpdateGallery = vi.fn()
const mockDeleteGallery = vi.fn()

vi.mock('@/lib/services/gallery.service', () => ({
  updateGallery: (...args: unknown[]) => mockUpdateGallery(...args),
  deleteGallery: (...args: unknown[]) => mockDeleteGallery(...args),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

type Params = { params: Promise<{ id: string }> }

function makeArtist(overrides = {}) {
  return { id: 'artist-1', plan: 'BASIC', ...overrides }
}

function makeCtx(id = 'g-1'): Params {
  return { params: Promise.resolve({ id }) }
}

function makePatchReq(body: unknown, id = 'g-1') {
  return new Request(`http://localhost/api/galleries/${id}`, {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })
}

function makeDeleteReq(id = 'g-1') {
  return new Request(`http://localhost/api/galleries/${id}`, { method: 'DELETE' })
}

// ── PATCH /api/galleries/[id] ─────────────────────────────────────────────────

describe('PATCH /api/galleries/[id]', () => {
  let PATCH: (req: Request, ctx: Params) => Promise<Response>

  beforeEach(async () => {
    vi.clearAllMocks()
    const mod = await import('@/app/api/galleries/[id]/route')
    PATCH = mod.PATCH
  })

  it('devuelve 401 si no hay sesión autenticada', async () => {
    mockRequireArtist.mockResolvedValue({
      artist: null,
      error:  NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    })
    const res = await PATCH(makePatchReq({ name: 'Nueva galería' }), makeCtx())
    expect(res.status).toBe(401)
  })

  it('devuelve 400 si el body no pasa la validación Zod', async () => {
    mockRequireArtist.mockResolvedValue({ artist: makeArtist(), error: null })

    // Enviar campo inválido — UpdateGallerySchema rechaza esto
    const res  = await PATCH(makePatchReq({ name: '' }), makeCtx())
    const body = await res.json() as { error: unknown }

    expect(res.status).toBe(400)
    expect(body.error).toBeDefined()
  })

  it('devuelve 200 con la galería actualizada en caso de éxito', async () => {
    const updated = { id: 'g-1', name: 'Galería renovada', visibility: 'PUBLIC', wallColor: '#f0ede8' }
    mockRequireArtist.mockResolvedValue({ artist: makeArtist(), error: null })
    mockUpdateGallery.mockResolvedValue(updated)

    const res  = await PATCH(makePatchReq({ name: 'Galería renovada' }), makeCtx())
    const body = await res.json() as typeof updated

    expect(res.status).toBe(200)
    expect(body.name).toBe('Galería renovada')
    expect(mockUpdateGallery).toHaveBeenCalledWith('g-1', 'artist-1', expect.objectContaining({ name: 'Galería renovada' }))
  })

  it('devuelve 403 si el artista no es propietario', async () => {
    mockRequireArtist.mockResolvedValue({ artist: makeArtist(), error: null })
    mockUpdateGallery.mockRejectedValue(new Error('FORBIDDEN: galería de otro artista'))

    const res = await PATCH(makePatchReq({ name: 'X' }), makeCtx())
    expect(res.status).toBe(403)
  })
})

// ── DELETE /api/galleries/[id] ────────────────────────────────────────────────

describe('DELETE /api/galleries/[id]', () => {
  let DELETE: (req: Request, ctx: Params) => Promise<Response>

  beforeEach(async () => {
    vi.clearAllMocks()
    const mod = await import('@/app/api/galleries/[id]/route')
    DELETE = mod.DELETE
  })

  it('devuelve 401 si no hay sesión autenticada', async () => {
    mockRequireArtist.mockResolvedValue({
      artist: null,
      error:  NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    })
    const res = await DELETE(makeDeleteReq(), makeCtx())
    expect(res.status).toBe(401)
  })

  it('devuelve 403 si el artista intenta borrar una galería ajena', async () => {
    mockRequireArtist.mockResolvedValue({ artist: makeArtist(), error: null })
    mockDeleteGallery.mockRejectedValue(new Error('FORBIDDEN: galería de otro artista'))

    const res = await DELETE(makeDeleteReq(), makeCtx())
    expect(res.status).toBe(403)
  })

  it('devuelve 204 sin body al eliminar correctamente', async () => {
    mockRequireArtist.mockResolvedValue({ artist: makeArtist(), error: null })
    mockDeleteGallery.mockResolvedValue(undefined)

    const res = await DELETE(makeDeleteReq(), makeCtx())
    expect(res.status).toBe(204)
    expect(res.body).toBeNull()
    expect(mockDeleteGallery).toHaveBeenCalledWith('g-1', 'artist-1')
  })

  it('llama al servicio con el id correcto del parámetro de ruta', async () => {
    mockRequireArtist.mockResolvedValue({ artist: makeArtist(), error: null })
    mockDeleteGallery.mockResolvedValue(undefined)

    await DELETE(makeDeleteReq('g-99'), makeCtx('g-99'))
    expect(mockDeleteGallery).toHaveBeenCalledWith('g-99', 'artist-1')
  })
})
