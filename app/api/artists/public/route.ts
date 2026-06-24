import { NextResponse } from 'next/server'
import { db }           from '@/lib/db'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') ?? ''
  const sort   = searchParams.get('sort')   ?? 'recent'

  const artists = await db.artist.findMany({
    where: {
      galleries: { some: { visibility: 'PUBLIC' } },
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
    },
    select: {
      id:        true,
      name:      true,
      bio:       true,
      avatarUrl: true,
      website:   true,
      createdAt: true,
      galleries: {
        where:   { visibility: 'PUBLIC' },
        orderBy: { createdAt: 'desc' },
        take: 1,
        select:  { slug: true, name: true },
      },
      _count: {
        select: {
          galleries: { where: { visibility: 'PUBLIC' } },
          artworks:  { where: { status: 'EXPOSED' } },
        },
      },
    },
    orderBy: sort === 'name' ? { name: 'asc' } : { createdAt: 'desc' },
  })

  const result = artists.map(a => ({
    id:             a.id,
    name:           a.name,
    bio:            a.bio,
    avatarUrl:      a.avatarUrl,
    website:        a.website,
    createdAt:      a.createdAt,
    galleryCount:   a._count.galleries,
    artworkCount:   a._count.artworks,
    primaryGallery: a.galleries[0] ?? null,
  }))

  return NextResponse.json(result)
}
