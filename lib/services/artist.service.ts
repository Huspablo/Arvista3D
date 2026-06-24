import { db } from '@/lib/db'
import type { Artist } from '@prisma/client'

// Límites de plan — fuente de verdad única para toda la app
export const PLAN_LIMITS = {
  BASIC:    { galleries: 1, artworksPerGallery: 10 },
  STANDARD: { galleries: 2, artworksPerGallery: 20 },
  PREMIUM:  { galleries: 3, artworksPerGallery: 50 },
} as const

// Obtiene el artista por clerkId. Si no existe lo crea (primer login).
export async function getOrCreateArtist(clerkId: string): Promise<Artist> {
  return db.artist.upsert({
    where:  { clerkId },
    update: {},
    create: { clerkId },
  })
}

export async function getArtistByClerkId(clerkId: string): Promise<Artist | null> {
  return db.artist.findUnique({ where: { clerkId } })
}

export async function updateArtist(
  artistId: string,
  data: { name?: string; bio?: string; website?: string; avatarUrl?: string },
): Promise<Artist> {
  return db.artist.update({ where: { id: artistId }, data })
}
