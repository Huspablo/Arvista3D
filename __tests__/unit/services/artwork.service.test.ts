import { describe, it, expect, vi, beforeEach } from 'vitest'
import { publishArtwork, unpublishArtwork } from '@/lib/services/artwork.service'

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('next/cache', () => ({ revalidateTag: vi.fn() }))

const mockDb = vi.hoisted(() => ({
  artwork:      { findFirst: vi.fn(), update: vi.fn() },
  gallery:      { findFirst: vi.fn() },
  gallerySlot:  { update: vi.fn() },
  $transaction: vi.fn().mockImplementation((ops: unknown[]) => Promise.all(ops)),
}))
vi.mock('@/lib/db', () => ({ db: mockDb }))

// ── Fixtures ──────────────────────────────────────────────────────────────────

const ARTIST_ID  = 'artist-1'
const ARTWORK_ID = 'artwork-1'
const GALLERY_ID = 'gallery-1'

function makeArtwork(overrides = {}) {
  return { id: ARTWORK_ID, artistId: ARTIST_ID, type: 'PAINTING', status: 'DRAFT', ...overrides }
}

function makeSlot(overrides = {}) {
  return { id: 'slot-1', artworkId: null, displayMode: 'WALL_PLANE', galleryId: GALLERY_ID, ...overrides }
}

function makeGallery(slots: ReturnType<typeof makeSlot>[]) {
  return { id: GALLERY_ID, artistId: ARTIST_ID, slots }
}

// ── publishArtwork ────────────────────────────────────────────────────────────

describe('publishArtwork', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lanza FORBIDDEN si la obra no pertenece al artista', async () => {
    mockDb.artwork.findFirst.mockResolvedValue(null)

    await expect(publishArtwork(ARTWORK_ID, GALLERY_ID, ARTIST_ID, 'BASIC'))
      .rejects.toThrow('FORBIDDEN')
  })

  it('lanza FORBIDDEN si la galería no pertenece al artista', async () => {
    mockDb.artwork.findFirst.mockResolvedValue(makeArtwork())
    mockDb.gallery.findFirst.mockResolvedValue(null)

    await expect(publishArtwork(ARTWORK_ID, GALLERY_ID, ARTIST_ID, 'BASIC'))
      .rejects.toThrow('FORBIDDEN')
  })

  it('lanza CAPACITY_REACHED si la galería está llena (plan BASIC = 10)', async () => {
    mockDb.artwork.findFirst.mockResolvedValue(makeArtwork())
    const fullSlots = Array.from({ length: 10 }, (_, i) =>
      makeSlot({ id: `slot-${i}`, artworkId: `aw-${i}` }),
    )
    mockDb.gallery.findFirst.mockResolvedValue(makeGallery(fullSlots))

    await expect(publishArtwork(ARTWORK_ID, GALLERY_ID, ARTIST_ID, 'BASIC'))
      .rejects.toThrow('CAPACITY_REACHED')
  })

  it('respeta el límite de plan STANDARD (20 obras)', async () => {
    mockDb.artwork.findFirst.mockResolvedValue(makeArtwork())
    const fullSlots = Array.from({ length: 20 }, (_, i) =>
      makeSlot({ id: `slot-${i}`, artworkId: `aw-${i}` }),
    )
    mockDb.gallery.findFirst.mockResolvedValue(makeGallery(fullSlots))

    await expect(publishArtwork(ARTWORK_ID, GALLERY_ID, ARTIST_ID, 'STANDARD'))
      .rejects.toThrow('CAPACITY_REACHED')
  })

  it('lanza NO_SLOT_AVAILABLE si no hay slot WALL_PLANE libre (pintura)', async () => {
    mockDb.artwork.findFirst.mockResolvedValue(makeArtwork({ type: 'PAINTING' }))
    // Todos los WALL_PLANE ocupados, solo hay uno FLOOR_MODEL libre
    const slots = [
      makeSlot({ id: 'slot-0', artworkId: 'aw-x', displayMode: 'WALL_PLANE' }),
      makeSlot({ id: 'slot-7', artworkId: null,   displayMode: 'FLOOR_MODEL' }),
    ]
    mockDb.gallery.findFirst.mockResolvedValue(makeGallery(slots))

    await expect(publishArtwork(ARTWORK_ID, GALLERY_ID, ARTIST_ID, 'BASIC'))
      .rejects.toThrow('NO_SLOT_AVAILABLE')
  })

  it('lanza NO_SLOT_AVAILABLE si no hay slot FLOOR_MODEL libre (escultura)', async () => {
    mockDb.artwork.findFirst.mockResolvedValue(makeArtwork({ type: 'SCULPTURE' }))
    // El FLOOR_MODEL está ocupado
    const slots = [
      makeSlot({ id: 'slot-0', artworkId: null,   displayMode: 'WALL_PLANE' }),
      makeSlot({ id: 'slot-7', artworkId: 'aw-x', displayMode: 'FLOOR_MODEL' }),
    ]
    mockDb.gallery.findFirst.mockResolvedValue(makeGallery(slots))

    await expect(publishArtwork(ARTWORK_ID, GALLERY_ID, ARTIST_ID, 'BASIC'))
      .rejects.toThrow('NO_SLOT_AVAILABLE')
  })

  it('expone la obra en el slot WALL_PLANE correcto (pintura)', async () => {
    const artwork   = makeArtwork({ type: 'PAINTING' })
    const freeSlot  = makeSlot({ id: 'slot-0', displayMode: 'WALL_PLANE' })
    const exposed   = { ...artwork, status: 'EXPOSED' }

    mockDb.artwork.findFirst.mockResolvedValue(artwork)
    mockDb.gallery.findFirst.mockResolvedValue(makeGallery([freeSlot]))
    mockDb.artwork.update.mockResolvedValue(exposed)
    mockDb.gallerySlot.update.mockResolvedValue({ ...freeSlot, artworkId: ARTWORK_ID })

    const result = await publishArtwork(ARTWORK_ID, GALLERY_ID, ARTIST_ID, 'BASIC')

    expect(result.status).toBe('EXPOSED')
    expect(mockDb.artwork.update).toHaveBeenCalledWith({
      where: { id: ARTWORK_ID },
      data:  { status: 'EXPOSED' },
    })
    expect(mockDb.gallerySlot.update).toHaveBeenCalledWith({
      where: { id: 'slot-0' },
      data:  { artworkId: ARTWORK_ID },
    })
  })

  it('expone la escultura en el slot FLOOR_MODEL', async () => {
    const artwork  = makeArtwork({ type: 'SCULPTURE' })
    const slots    = [
      makeSlot({ id: 'slot-0', displayMode: 'WALL_PLANE' }),
      makeSlot({ id: 'slot-7', displayMode: 'FLOOR_MODEL' }),
    ]
    const exposed  = { ...artwork, status: 'EXPOSED' }

    mockDb.artwork.findFirst.mockResolvedValue(artwork)
    mockDb.gallery.findFirst.mockResolvedValue(makeGallery(slots))
    mockDb.artwork.update.mockResolvedValue(exposed)
    mockDb.gallerySlot.update.mockResolvedValue({})

    const result = await publishArtwork(ARTWORK_ID, GALLERY_ID, ARTIST_ID, 'BASIC')

    expect(result.status).toBe('EXPOSED')
    expect(mockDb.gallerySlot.update).toHaveBeenCalledWith({
      where: { id: 'slot-7' },
      data:  { artworkId: ARTWORK_ID },
    })
  })
})

// ── unpublishArtwork ──────────────────────────────────────────────────────────

describe('unpublishArtwork', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lanza FORBIDDEN si la obra no pertenece al artista', async () => {
    mockDb.artwork.findFirst.mockResolvedValue(null)

    await expect(unpublishArtwork(ARTWORK_ID, ARTIST_ID))
      .rejects.toThrow('FORBIDDEN')
  })

  it('lanza INVALID_STATE si la obra no está expuesta', async () => {
    mockDb.artwork.findFirst.mockResolvedValue(
      makeArtwork({ status: 'DRAFT', slot: makeSlot() }),
    )

    await expect(unpublishArtwork(ARTWORK_ID, ARTIST_ID))
      .rejects.toThrow('INVALID_STATE')
  })

  it('retira la obra: vuelve a DRAFT y libera el slot', async () => {
    const slot    = makeSlot({ artworkId: ARTWORK_ID })
    const artwork = makeArtwork({ status: 'EXPOSED', slot })
    const draft   = { ...artwork, status: 'DRAFT' }

    mockDb.artwork.findFirst.mockResolvedValue(artwork)
    mockDb.artwork.update.mockResolvedValue(draft)
    mockDb.gallerySlot.update.mockResolvedValue({ ...slot, artworkId: null })

    const result = await unpublishArtwork(ARTWORK_ID, ARTIST_ID)

    expect(result.status).toBe('DRAFT')
    expect(mockDb.gallerySlot.update).toHaveBeenCalledWith({
      where: { id: 'slot-1' },
      data:  { artworkId: null },
    })
  })
})
