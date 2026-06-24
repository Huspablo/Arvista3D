import { NextResponse } from 'next/server'
import { db }           from '@/lib/db'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') ?? ''
  const sort   = searchParams.get('sort')   ?? 'recent'

  const galleries = await db.gallery.findMany({
    where: {
      visibility: 'PUBLIC',
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
    },
    include: {
      artist: { select: { id: true, name: true, avatarUrl: true } },
      _count:  { select: { slots: { where: { artworkId: { not: null } } } } },
      slots: {
        where:   { artworkId: { not: null } },
        orderBy: { position: 'asc' },
        take: 3,
        select:  { artwork: { select: { assetThumbnail: true, title: true } } },
      },
    },
    orderBy: sort === 'name' ? { name: 'asc' } : { createdAt: 'desc' },
  })

  const result = galleries.map(g => ({
    id:            g.id,
    name:          g.name,
    description:   g.description,
    slug:          g.slug,
    createdAt:     g.createdAt,
    artist:        g.artist,
    exposedCount:  g._count.slots,
    previewImages: g.slots.map(s => s.artwork?.assetThumbnail ?? null).filter(Boolean),
  }))

  return NextResponse.json(result)
}
