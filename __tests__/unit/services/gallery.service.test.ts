import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  assertGalleryQuota,
  createGallery,
  updateGallery,
  listGalleriesByArtist,
  getGalleryBySlug,
  deleteGallery,
} from '@/lib/services/gallery.service'

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockRevalidateTag = vi.hoisted(() => vi.fn())
vi.mock('next/cache', () => ({ revalidateTag: mockRevalidateTag }))

const mockDb = vi.hoisted(() => ({
  gallery:      { count: vi.fn(), findFirst: vi.fn(), findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  gallerySlot:  { findMany: vi.fn() },
  artwork:      { updateMany: vi.fn() },
  $transaction: vi.fn().mockImplementation((ops: unknown[]) => Promise.all(ops)),
}))
vi.mock('@/lib/db', () => ({ db: mockDb }))

// ── Fixtures ──────────────────────────────────────────────────────────────────

const ARTIST_ID  = 'artist-1'
const GALLERY_ID = 'gallery-1'

function makeGalleryRecord(overrides = {}) {
  return {
    id:          GALLERY_ID,
    artistId:    ARTIST_ID,
    name:        'Mi galería',
    slug:        'mi-galeria',
    description: '',
    visibility:  'PRIVATE',
    templateKey: 'white-cube-8',
    wallColor:   '#ffffff',
    createdAt:   new Date(),
    updatedAt:   new Date(),
    ...overrides,
  }
}

// ── assertGalleryQuota ────────────────────────────────────────────────────────

describe('assertGalleryQuota', () => {
  beforeEach(() => vi.clearAllMocks())

  it('BASIC — permite 0 galerías existentes', async () => {
    mockDb.gallery.count.mockResolvedValue(0)
    await expect(assertGalleryQuota(ARTIST_ID, 'BASIC')).resolves.toBeUndefined()
  })

  it('BASIC — lanza GALLERY_LIMIT_REACHED al tener 1 galería', async () => {
    mockDb.gallery.count.mockResolvedValue(1)
    await expect(assertGalleryQuota(ARTIST_ID, 'BASIC'))
      .rejects.toThrow('GALLERY_LIMIT_REACHED')
  })

  it('STANDARD — permite 1 galería existente', async () => {
    mockDb.gallery.count.mockResolvedValue(1)
    await expect(assertGalleryQuota(ARTIST_ID, 'STANDARD')).resolves.toBeUndefined()
  })

  it('STANDARD — lanza GALLERY_LIMIT_REACHED al tener 2 galerías', async () => {
    mockDb.gallery.count.mockResolvedValue(2)
    await expect(assertGalleryQuota(ARTIST_ID, 'STANDARD'))
      .rejects.toThrow('GALLERY_LIMIT_REACHED')
  })

  it('PREMIUM — permite 2 galerías existentes', async () => {
    mockDb.gallery.count.mockResolvedValue(2)
    await expect(assertGalleryQuota(ARTIST_ID, 'PREMIUM')).resolves.toBeUndefined()
  })

  it('PREMIUM — lanza GALLERY_LIMIT_REACHED al tener 3 galerías', async () => {
    mockDb.gallery.count.mockResolvedValue(3)
    await expect(assertGalleryQuota(ARTIST_ID, 'PREMIUM'))
      .rejects.toThrow('GALLERY_LIMIT_REACHED')
  })
})

// ── deleteGallery ─────────────────────────────────────────────────────────────

describe('deleteGallery', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lanza FORBIDDEN si la galería no pertenece al artista', async () => {
    mockDb.gallery.findFirst.mockResolvedValue(null)

    await expect(deleteGallery(GALLERY_ID, ARTIST_ID))
      .rejects.toThrow('FORBIDDEN')
  })

  it('elimina la galería sin obras expuestas sin llamar a updateMany', async () => {
    mockDb.gallery.findFirst.mockResolvedValue({ id: GALLERY_ID })
    mockDb.gallerySlot.findMany.mockResolvedValue([]) // sin obras expuestas
    mockDb.gallery.delete.mockResolvedValue({ id: GALLERY_ID })

    await deleteGallery(GALLERY_ID, ARTIST_ID)

    expect(mockDb.$transaction).toHaveBeenCalledWith(
      expect.arrayContaining([expect.anything()]),
    )
    expect(mockDb.artwork.updateMany).not.toHaveBeenCalled()
  })

  it('pone en DRAFT las obras expuestas al eliminar la galería', async () => {
    mockDb.gallery.findFirst.mockResolvedValue({ id: GALLERY_ID })
    mockDb.gallerySlot.findMany.mockResolvedValue([
      { artworkId: 'aw-1' },
      { artworkId: 'aw-2' },
    ])
    mockDb.gallery.delete.mockResolvedValue({ id: GALLERY_ID })
    mockDb.artwork.updateMany.mockResolvedValue({ count: 2 })

    await deleteGallery(GALLERY_ID, ARTIST_ID)

    expect(mockDb.artwork.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['aw-1', 'aw-2'] } },
      data:  { status: 'DRAFT' },
    })
  })
})

// ── createGallery ─────────────────────────────────────────────────────────────

describe('createGallery', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lanza GALLERY_LIMIT_REACHED si el artista ha alcanzado el límite', async () => {
    mockDb.gallery.count.mockResolvedValue(1) // plan BASIC: max 1

    await expect(createGallery(ARTIST_ID, 'BASIC', { name: 'Nueva' }))
      .rejects.toThrow('GALLERY_LIMIT_REACHED')
  })

  it('crea la galería con los 8 slots de white-cube-8 por defecto', async () => {
    mockDb.gallery.count.mockResolvedValue(0)
    mockDb.gallery.findUnique.mockResolvedValue(null) // slug disponible
    mockDb.gallery.create.mockResolvedValue(makeGalleryRecord())

    await createGallery(ARTIST_ID, 'BASIC', { name: 'Mi galería' })

    expect(mockDb.gallery.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          artistId:    ARTIST_ID,
          name:        'Mi galería',
          templateKey: 'white-cube-8',
          slots:       expect.objectContaining({ createMany: expect.anything() }),
        }),
      }),
    )
  })

  it('usa el templateKey proporcionado en lugar del valor por defecto', async () => {
    mockDb.gallery.count.mockResolvedValue(0)
    mockDb.gallery.findUnique.mockResolvedValue(null)
    mockDb.gallery.create.mockResolvedValue(makeGalleryRecord({ templateKey: 'long-hall-12' }))

    await createGallery(ARTIST_ID, 'STANDARD', { name: 'Pasillo', templateKey: 'long-hall-12' })

    expect(mockDb.gallery.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ templateKey: 'long-hall-12' }),
      }),
    )
  })

  it('genera un slug único añadiendo sufijo si ya existe', async () => {
    mockDb.gallery.count.mockResolvedValue(0)
    // Primer intento: slug 'mi-galeria' ocupado; segundo: disponible
    mockDb.gallery.findUnique
      .mockResolvedValueOnce({ id: 'other' })
      .mockResolvedValueOnce(null)
    mockDb.gallery.create.mockResolvedValue(makeGalleryRecord({ slug: 'mi-galeria-1' }))

    await createGallery(ARTIST_ID, 'BASIC', { name: 'Mi galería' })

    const createCall = mockDb.gallery.create.mock.calls[0][0]
    expect(createCall.data.slug).toBe('mi-galeria-1')
  })
})

// ── updateGallery ─────────────────────────────────────────────────────────────

describe('updateGallery', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lanza FORBIDDEN si la galería no pertenece al artista', async () => {
    mockDb.gallery.findFirst.mockResolvedValue(null)

    await expect(updateGallery(GALLERY_ID, ARTIST_ID, { name: 'Nuevo nombre' }))
      .rejects.toThrow('FORBIDDEN')
  })

  it('actualiza los campos y devuelve la galería actualizada', async () => {
    mockDb.gallery.findFirst.mockResolvedValue(makeGalleryRecord())
    const updated = makeGalleryRecord({ name: 'Nuevo nombre' })
    mockDb.gallery.update.mockResolvedValue(updated)

    const result = await updateGallery(GALLERY_ID, ARTIST_ID, { name: 'Nuevo nombre' })

    expect(mockDb.gallery.update).toHaveBeenCalledWith({
      where: { id: GALLERY_ID },
      data:  { name: 'Nuevo nombre' },
    })
    expect(result).toEqual(updated)
  })

  it('invalida la caché del manifest tras actualizar', async () => {
    mockDb.gallery.findFirst.mockResolvedValue(makeGalleryRecord())
    mockDb.gallery.update.mockResolvedValue(makeGalleryRecord())

    await updateGallery(GALLERY_ID, ARTIST_ID, { visibility: 'PUBLIC' })

    expect(mockRevalidateTag).toHaveBeenCalledWith(`manifest-${GALLERY_ID}`, {})
  })
})

// ── listGalleriesByArtist ─────────────────────────────────────────────────────

describe('listGalleriesByArtist', () => {
  beforeEach(() => vi.clearAllMocks())

  it('devuelve las galerías del artista ordenadas por fecha descendente', async () => {
    const galleries = [makeGalleryRecord(), makeGalleryRecord({ id: 'gallery-2' })]
    mockDb.gallery.findMany.mockResolvedValue(galleries)

    const result = await listGalleriesByArtist(ARTIST_ID)

    expect(mockDb.gallery.findMany).toHaveBeenCalledWith({
      where:   { artistId: ARTIST_ID },
      orderBy: { createdAt: 'desc' },
    })
    expect(result).toEqual(galleries)
  })
})

// ── getGalleryBySlug ──────────────────────────────────────────────────────────

describe('getGalleryBySlug', () => {
  beforeEach(() => vi.clearAllMocks())

  it('busca por slug e incluye artista y slots con sus obras', async () => {
    const gallery = makeGalleryRecord()
    mockDb.gallery.findUnique.mockResolvedValue(gallery)

    const result = await getGalleryBySlug('mi-galeria')

    expect(mockDb.gallery.findUnique).toHaveBeenCalledWith({
      where:   { slug: 'mi-galeria' },
      include: { artist: true, slots: { include: { artwork: true } } },
    })
    expect(result).toEqual(gallery)
  })

  it('devuelve null si el slug no existe', async () => {
    mockDb.gallery.findUnique.mockResolvedValue(null)

    const result = await getGalleryBySlug('no-existe')
    expect(result).toBeNull()
  })
})
