import { revalidateTag } from 'next/cache'
import { db } from '@/lib/db'
import { PLAN_LIMITS } from './artist.service'
import type { Artwork, ArtworkType } from '@prisma/client'

const galleryManifestTag = (id: string) => `manifest-${id}`

type CreateArtworkInput = {
  title:       string
  description?: string
  type:        ArtworkType
  year?:       number
  technique?:  string
  edition?:    string
  tags?:       string[]
  dimWidth?:   number
  dimHeight?:  number
  dimDepth?:   number
}

type UpdateArtworkInput = Partial<CreateArtworkInput> & {
  assetOriginalKey?: string
  assetThumbnail?:   string
  assetGallery?:     string
  assetDetail?:      string
  assetModel?:       string
}

export async function createArtwork(artistId: string, data: CreateArtworkInput): Promise<Artwork> {
  return db.artwork.create({
    data: {
      ...data,
      tags:     data.tags ?? [],
      artistId,
    },
  })
}

export async function listArtworksByArtist(artistId: string) {
  return db.artwork.findMany({
    where:   { artistId },
    orderBy: { createdAt: 'desc' },
    include: {
      slot: {
        select: {
          gallery: { select: { name: true, slug: true } },
        },
      },
    },
  })
}

export async function getArtwork(id: string, artistId: string): Promise<Artwork | null> {
  return db.artwork.findFirst({ where: { id, artistId } })
}

export async function updateArtwork(
  id:       string,
  artistId: string,
  data:     UpdateArtworkInput,
): Promise<Artwork> {
  const artwork = await db.artwork.findFirst({ where: { id, artistId } })
  if (!artwork) throw new Error('FORBIDDEN: obra no encontrada o sin permisos')
  return db.artwork.update({ where: { id }, data })
}

export async function deleteArtwork(id: string, artistId: string): Promise<void> {
  const artwork = await db.artwork.findFirst({ where: { id, artistId } })
  if (!artwork) throw new Error('FORBIDDEN: obra no encontrada o sin permisos')
  // Si estaba expuesta, el slot queda libre (onDelete: SetNull en el schema)
  await db.artwork.delete({ where: { id } })
}

// ── Publicación — regla 3.2 ────────────────────────────────────────────────

export async function publishArtwork(
  artworkId: string,
  galleryId: string,
  artistId:  string,
  plan:      keyof typeof PLAN_LIMITS,
): Promise<Artwork> {
  // 1. Verificar propiedad de la obra
  const artwork = await db.artwork.findFirst({ where: { id: artworkId, artistId } })
  if (!artwork) throw new Error('FORBIDDEN: obra no encontrada o sin permisos')

  // 2. Verificar propiedad de la galería
  const gallery = await db.gallery.findFirst({
    where:   { id: galleryId, artistId },
    include: { slots: { include: { artwork: true } } },
  })
  if (!gallery) throw new Error('FORBIDDEN: galería no encontrada o sin permisos')

  // 3. Verificar capacidad del plan
  const exposedCount = gallery.slots.filter(s => s.artworkId !== null).length
  if (exposedCount >= PLAN_LIMITS[plan].artworksPerGallery) {
    throw new Error(`CAPACITY_REACHED: la galería ha alcanzado el límite de ${PLAN_LIMITS[plan].artworksPerGallery} obras`)
  }

  // 4. Encontrar un slot compatible libre
  // Esculturas → FLOOR_MODEL; el resto → WALL_PLANE
  const neededMode = artwork.type === 'SCULPTURE' ? 'FLOOR_MODEL' : 'WALL_PLANE'
  const freeSlot   = gallery.slots.find(s => s.displayMode === neededMode && s.artworkId === null)
  if (!freeSlot) {
    throw new Error(`NO_SLOT_AVAILABLE: no hay posición compatible (${neededMode}) libre en esta galería`)
  }

  // 5. Asignar en transacción atómica
  const [updatedArtwork] = await db.$transaction([
    db.artwork.update({
      where: { id: artworkId },
      data:  { status: 'EXPOSED' },
    }),
    db.gallerySlot.update({
      where: { id: freeSlot.id },
      data:  { artworkId },
    }),
  ])

  revalidateTag(galleryManifestTag(galleryId), {})
  return updatedArtwork
}

// ── Retirada — regla 3.4 ───────────────────────────────────────────────────

export async function unpublishArtwork(artworkId: string, artistId: string): Promise<Artwork> {
  const artwork = await db.artwork.findFirst({
    where:   { id: artworkId, artistId },
    include: { slot: true },
  })
  if (!artwork) throw new Error('FORBIDDEN: obra no encontrada o sin permisos')
  if (artwork.status !== 'EXPOSED') throw new Error('INVALID_STATE: la obra no está expuesta')

  const galleryId = artwork.slot!.galleryId

  const [updatedArtwork] = await db.$transaction([
    db.artwork.update({
      where: { id: artworkId },
      data:  { status: 'DRAFT' },
    }),
    db.gallerySlot.update({
      where: { id: artwork.slot!.id },
      data:  { artworkId: null },
    }),
  ])

  revalidateTag(galleryManifestTag(galleryId), {})
  return updatedArtwork
}

