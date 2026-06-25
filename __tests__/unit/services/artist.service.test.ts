import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getOrCreateArtist, updateArtist } from '@/lib/services/artist.service'

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockDb = vi.hoisted(() => ({
  artist: { upsert: vi.fn(), update: vi.fn() },
}))
vi.mock('@/lib/db', () => ({ db: mockDb }))

// ── Fixtures ──────────────────────────────────────────────────────────────────

const CLERK_ID  = 'clerk-123'
const ARTIST_ID = 'artist-1'

function makeArtist(overrides = {}) {
  return {
    id:                   ARTIST_ID,
    clerkId:              CLERK_ID,
    name:                 'Test Artist',
    bio:                  null,
    website:              null,
    avatarUrl:            null,
    plan:                 'BASIC',
    stripeCustomerId:     null,
    stripeSubscriptionId: null,
    createdAt:            new Date(),
    updatedAt:            new Date(),
    ...overrides,
  }
}

// ── getOrCreateArtist ─────────────────────────────────────────────────────────

describe('getOrCreateArtist', () => {
  beforeEach(() => vi.clearAllMocks())

  it('llama a upsert con el clerkId como clave de búsqueda', async () => {
    mockDb.artist.upsert.mockResolvedValue(makeArtist())

    await getOrCreateArtist(CLERK_ID)

    expect(mockDb.artist.upsert).toHaveBeenCalledWith({
      where:  { clerkId: CLERK_ID },
      update: {},
      create: { clerkId: CLERK_ID },
    })
  })

  it('devuelve el artista retornado por upsert', async () => {
    const artist = makeArtist({ name: 'Nuevo Artista' })
    mockDb.artist.upsert.mockResolvedValue(artist)

    const result = await getOrCreateArtist(CLERK_ID)
    expect(result).toEqual(artist)
  })
})

// ── updateArtist ──────────────────────────────────────────────────────────────

describe('updateArtist', () => {
  beforeEach(() => vi.clearAllMocks())

  it('actualiza solo los campos proporcionados', async () => {
    const updated = makeArtist({ name: 'Nuevo Nombre' })
    mockDb.artist.update.mockResolvedValue(updated)

    await updateArtist(ARTIST_ID, { name: 'Nuevo Nombre' })

    expect(mockDb.artist.update).toHaveBeenCalledWith({
      where: { id: ARTIST_ID },
      data:  { name: 'Nuevo Nombre' },
    })
  })

  it('permite borrar el website pasando null', async () => {
    mockDb.artist.update.mockResolvedValue(makeArtist({ website: null }))

    await updateArtist(ARTIST_ID, { website: null })

    expect(mockDb.artist.update).toHaveBeenCalledWith({
      where: { id: ARTIST_ID },
      data:  { website: null },
    })
  })

  it('devuelve el artista actualizado', async () => {
    const updated = makeArtist({ bio: 'Mi nueva bio' })
    mockDb.artist.update.mockResolvedValue(updated)

    const result = await updateArtist(ARTIST_ID, { bio: 'Mi nueva bio' })
    expect(result).toEqual(updated)
  })
})
