import { revalidateTag } from 'next/cache'
import { db } from '@/lib/db'
import { PLAN_LIMITS } from './artist.service'
import type { Gallery, Visibility, FloorMaterial, LightingPreset } from '@prisma/client'

const galleryManifestTag = (id: string) => `manifest-${id}`

// Plantilla white-cube-8: 7 slots de pared + 1 pedestal
const WHITE_CUBE_8_SLOTS = [
  { position: 0, displayMode: 'WALL_PLANE'  as const },
  { position: 1, displayMode: 'WALL_PLANE'  as const },
  { position: 2, displayMode: 'WALL_PLANE'  as const },
  { position: 3, displayMode: 'WALL_PLANE'  as const },
  { position: 4, displayMode: 'WALL_PLANE'  as const },
  { position: 5, displayMode: 'WALL_PLANE'  as const },
  { position: 6, displayMode: 'WALL_PLANE'  as const },
  { position: 7, displayMode: 'FLOOR_MODEL' as const },
]

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')  // elimina tildes
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// Genera un slug único añadiendo sufijo numérico si ya existe
async function uniqueSlug(base: string): Promise<string> {
  let slug = base
  let n    = 1
  while (await db.gallery.findUnique({ where: { slug } })) {
    slug = `${base}-${n++}`
  }
  return slug
}

// ── Regla 3.3: un artista solo puede crear galerías dentro del límite de su plan ──
export async function assertGalleryQuota(artistId: string, plan: keyof typeof PLAN_LIMITS) {
  const count = await db.gallery.count({ where: { artistId } })
  if (count >= PLAN_LIMITS[plan].galleries) {
    throw new Error(`GALLERY_LIMIT_REACHED: tu plan ${plan} permite un máximo de ${PLAN_LIMITS[plan].galleries} galería(s)`)
  }
}

export async function createGallery(
  artistId: string,
  plan: keyof typeof PLAN_LIMITS,
  data: { name: string; description?: string; visibility?: Visibility },
): Promise<Gallery> {
  await assertGalleryQuota(artistId, plan)

  const slug = await uniqueSlug(toSlug(data.name))

  return db.gallery.create({
    data: {
      slug,
      name:        data.name,
      description: data.description ?? '',
      visibility:  data.visibility  ?? 'PRIVATE',
      artistId,
      // Pre-crear los 8 slots de la plantilla white-cube-8
      slots: { createMany: { data: WHITE_CUBE_8_SLOTS } },
    },
  })
}

export async function listGalleriesByArtist(artistId: string): Promise<Gallery[]> {
  return db.gallery.findMany({
    where:   { artistId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getGalleryBySlug(slug: string) {
  return db.gallery.findUnique({
    where:   { slug },
    include: { artist: true, slots: { include: { artwork: true } } },
  })
}

export async function updateGallery(
  galleryId: string,
  artistId:  string,
  data: {
    name?:          string
    description?:   string
    visibility?:    Visibility
    wallColor?:     string
    floorMaterial?: FloorMaterial
    lightingPreset?: LightingPreset
  },
): Promise<Gallery> {
  // Verificar propiedad (regla 3.1)
  const gallery = await db.gallery.findFirst({ where: { id: galleryId, artistId } })
  if (!gallery) throw new Error('FORBIDDEN: galería no encontrada o sin permisos')

  const updated = await db.gallery.update({ where: { id: galleryId }, data })
  revalidateTag(galleryManifestTag(galleryId), {})
  return updated
}

export async function deleteGallery(galleryId: string, artistId: string): Promise<void> {
  const gallery = await db.gallery.findFirst({ where: { id: galleryId, artistId } })
  if (!gallery) throw new Error('FORBIDDEN: galería no encontrada o sin permisos')

  // Al borrar la galería se borran sus slots (Cascade).
  // Las obras asignadas quedan con slot=null — el servicio de obras las pone en DRAFT.
  const slots = await db.gallerySlot.findMany({
    where:  { galleryId, artworkId: { not: null } },
    select: { artworkId: true },
  })
  const artworkIds = slots.map(s => s.artworkId!)

  await db.$transaction([
    db.gallery.delete({ where: { id: galleryId } }),
    // Poner en DRAFT las obras que estaban expuestas en esta galería
    ...(artworkIds.length
      ? [db.artwork.updateMany({ where: { id: { in: artworkIds } }, data: { status: 'DRAFT' } })]
      : []),
  ])
}
