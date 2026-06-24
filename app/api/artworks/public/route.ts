import { NextResponse } from 'next/server'
import { db }           from '@/lib/db'
import type { ArtworkType } from '@prisma/client'

const VALID_TYPES: ArtworkType[] = ['PAINTING', 'SCULPTURE', 'PHOTOGRAPHY', 'OTHER']

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type   = searchParams.get('type')   as ArtworkType | null
  const search = searchParams.get('search') ?? ''
  const sort   = searchParams.get('sort')   ?? 'recent'

  const artworks = await db.artwork.findMany({
    where: {
      status:     'EXPOSED',
      slot:       { gallery: { visibility: 'PUBLIC' } },
      ...(type && VALID_TYPES.includes(type) && { type }),
      ...(search && { title: { contains: search, mode: 'insensitive' } }),
    },
    include: {
      artist: { select: { id: true, name: true } },
      slot:   { select: { gallery: { select: { id: true, name: true, slug: true } } } },
    },
    orderBy: sort === 'title' ? { title: 'asc' } : { createdAt: 'desc' },
  })

  return NextResponse.json(artworks)
}
