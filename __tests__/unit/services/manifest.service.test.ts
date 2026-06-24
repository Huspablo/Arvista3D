import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildManifest } from '@/lib/services/manifest.service'

// ── Mocks ─────────────────────────────────────────────────────────────────────

// unstable_cache devuelve la función tal cual (sin cachear) para poder testear
vi.mock('next/cache', () => ({
  unstable_cache: vi.fn().mockImplementation((fn: () => unknown) => fn),
  revalidateTag:  vi.fn(),
}))

vi.mock('@/lib/r2', () => ({
  cdnUrl: vi.fn().mockImplementation((key: string) => `https://cdn.example.com/${key}`),
}))

const mockDb = vi.hoisted(() => ({
  gallery: { findUnique: vi.fn() },
}))
vi.mock('@/lib/db', () => ({ db: mockDb }))

// ── Fixtures ──────────────────────────────────────────────────────────────────

const GALLERY_ID = 'gallery-1'

function makeGallery(overrides = {}) {
  return {
    id:             GALLERY_ID,
    name:           'Galería de prueba',
    templateKey:    'white-cube-8',
    wallColor:      null,
    floorMaterial:  'CONCRETE',
    lightingPreset: 'NEUTRAL',
    artist:         { name: 'Artista Test' },
    slots:          [],
    ...overrides,
  }
}

function makeSlotWithArtwork(displayMode: 'WALL_PLANE' | 'FLOOR_MODEL') {
  return {
    id:          'slot-1',
    position:    0,
    displayMode,
    artwork: {
      id:           'aw-1',
      title:        'Obra Test',
      type:         displayMode === 'FLOOR_MODEL' ? 'SCULPTURE' : 'PAINTING',
      year:         2024,
      tags:         ['abstract'],
      dimWidth:     100,
      dimHeight:    80,
      dimDepth:     displayMode === 'FLOOR_MODEL' ? 40 : null,
      // thumbnail / gallery / detail se almacenan como URLs CDN completas (el pipeline
      // de Inngest llama a cdnUrl() antes de guardar). assetModel sí es clave cruda.
      assetThumbnail: 'https://cdn.example.com/thumbs/aw-1.webp',
      assetGallery:   displayMode === 'WALL_PLANE'  ? 'https://cdn.example.com/gallery/aw-1.webp' : null,
      assetDetail:    displayMode === 'WALL_PLANE'  ? 'https://cdn.example.com/detail/aw-1.webp'  : null,
      assetModel:     displayMode === 'FLOOR_MODEL' ? 'models/aw-1.glb'    : null,
      artist:         { name: 'Artista Test' },
    },
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('buildManifest', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lanza GALLERY_NOT_FOUND si la galería no existe', async () => {
    mockDb.gallery.findUnique.mockResolvedValue(null)

    await expect(buildManifest(GALLERY_ID)).rejects.toThrow('GALLERY_NOT_FOUND')
  })

  it('devuelve un manifest con la estructura correcta y slots vacíos', async () => {
    const emptySlot = { id: 'slot-1', position: 0, displayMode: 'WALL_PLANE', artwork: null }
    mockDb.gallery.findUnique.mockResolvedValue(makeGallery({ slots: [emptySlot] }))

    const manifest = await buildManifest(GALLERY_ID)

    expect(manifest.gallery.id).toBe(GALLERY_ID)
    expect(manifest.gallery.config.floorMaterial).toBe('concrete') // lowercase
    expect(manifest.gallery.config.lightingPreset).toBe('neutral') // lowercase
    expect(manifest.slots).toHaveLength(1)
    expect(manifest.slots[0].artwork).toBeNull()
  })

  it('slot WALL_PLANE con obra incluye assets thumbnail, gallery y detail', async () => {
    const slot = makeSlotWithArtwork('WALL_PLANE')
    mockDb.gallery.findUnique.mockResolvedValue(makeGallery({ slots: [slot] }))

    const manifest = await buildManifest(GALLERY_ID)
    const slotResult = manifest.slots[0]

    expect(slotResult.displayMode).toBe('WALL_PLANE')
    expect(slotResult.artwork).not.toBeNull()
    expect(slotResult.artwork!.assets).toMatchObject({
      thumbnail: 'https://cdn.example.com/thumbs/aw-1.webp',
      gallery:   'https://cdn.example.com/gallery/aw-1.webp',
      detail:    'https://cdn.example.com/detail/aw-1.webp',
    })
    // WALL_PLANE no lleva model
    expect((slotResult.artwork!.assets as Record<string, unknown>).model).toBeUndefined()
  })

  it('slot FLOOR_MODEL con obra incluye assets model y thumbnail (sin gallery/detail)', async () => {
    const slot = makeSlotWithArtwork('FLOOR_MODEL')
    mockDb.gallery.findUnique.mockResolvedValue(makeGallery({ slots: [slot] }))

    const manifest = await buildManifest(GALLERY_ID)
    const slotResult = manifest.slots[0]

    expect(slotResult.displayMode).toBe('FLOOR_MODEL')
    expect(slotResult.artwork!.assets).toMatchObject({
      model:     'https://cdn.example.com/models/aw-1.glb',
      thumbnail: 'https://cdn.example.com/thumbs/aw-1.webp',
    })
    expect((slotResult.artwork!.assets as Record<string, unknown>).gallery).toBeUndefined()
    expect((slotResult.artwork!.assets as Record<string, unknown>).detail).toBeUndefined()
  })

  it('incluye dimensiones cuando están definidas y omite depth si es null', async () => {
    const slot = makeSlotWithArtwork('WALL_PLANE')
    mockDb.gallery.findUnique.mockResolvedValue(makeGallery({ slots: [slot] }))

    const manifest = await buildManifest(GALLERY_ID)

    expect(manifest.slots[0].artwork!.dimensions).toMatchObject({ width: 100, height: 80 })
    expect(manifest.slots[0].artwork!.dimensions?.depth).toBeUndefined()
  })
})
