import { NextResponse } from 'next/server'
import { requireArtist, serviceErrorToResponse } from '@/lib/api-helpers'
import { createGallery } from '@/lib/services/gallery.service'
import { CreateGallerySchema } from '@/lib/schemas'
import { db } from '@/lib/db'

export async function GET() {
  const { artist, error } = await requireArtist()
  if (error) return error

  try {
    const galleries = await db.gallery.findMany({
      where:   { artistId: artist.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { slots: { where: { artworkId: { not: null } } } } },
        slots: {
          where:   { artworkId: { not: null } },
          orderBy: { position: 'asc' },
          take:    3,
          select:  { artwork: { select: { assetThumbnail: true } } },
        },
      },
    })
    return NextResponse.json(
      galleries.map(({ _count, slots, ...g }) => ({
        ...g,
        exposedCount:  _count.slots,
        previewImages: slots
          .map(s => s.artwork?.assetThumbnail)
          .filter((url): url is string => Boolean(url)),
      }))
    )
  } catch (err) {
    return serviceErrorToResponse(err)
  }
}

export async function POST(req: Request) {
  const { artist, error } = await requireArtist()
  if (error) return error

  try {
    const body   = await req.json()
    const parsed = CreateGallerySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
    }
    const gallery = await createGallery(artist.id, artist.plan, parsed.data)
    return NextResponse.json(gallery, { status: 201 })
  } catch (err) {
    return serviceErrorToResponse(err)
  }
}
