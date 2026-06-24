import { describe, it, expect, vi, beforeEach } from 'vitest'
import { assertGalleryQuota, deleteGallery } from '@/lib/services/gallery.service'

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('next/cache', () => ({ revalidateTag: vi.fn() }))

const mockDb = vi.hoisted(() => ({
  gallery:      { count: vi.fn(), findFirst: vi.fn(), delete: vi.fn() },
  gallerySlot:  { findMany: vi.fn() },
  artwork:      { updateMany: vi.fn() },
  $transaction: vi.fn().mockImplementation((ops: unknown[]) => Promise.all(ops)),
}))
vi.mock('@/lib/db', () => ({ db: mockDb }))

// ── Fixtures ──────────────────────────────────────────────────────────────────

const ARTIST_ID  = 'artist-1'
const GALLERY_ID = 'gallery-1'

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
