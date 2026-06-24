import { NextResponse } from 'next/server'
import { requireArtist, serviceErrorToResponse } from '@/lib/api-helpers'
import { publishArtwork } from '@/lib/services/artwork.service'
import { PublishArtworkSchema } from '@/lib/schemas'

type Params = { params: Promise<{ id: string }> }

export async function POST(req: Request, { params }: Params) {
  const { artist, error } = await requireArtist()
  if (error) return error

  try {
    const { id } = await params
    const body   = await req.json()
    const parsed = PublishArtworkSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
    }
    const artwork = await publishArtwork(id, parsed.data.galleryId, artist.id, artist.plan)
    return NextResponse.json(artwork)
  } catch (err) {
    return serviceErrorToResponse(err)
  }
}
