import { db } from '@/lib/db'
import type { Artist } from '@prisma/client'
export { PLAN_LIMITS } from '@/lib/plans'

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
  data: { name?: string; bio?: string; website?: string | null; avatarUrl?: string },
): Promise<Artist> {
  return db.artist.update({ where: { id: artistId }, data })
}
