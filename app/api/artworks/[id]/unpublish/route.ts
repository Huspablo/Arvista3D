import { NextResponse } from 'next/server'
import { requireArtist, serviceErrorToResponse } from '@/lib/api-helpers'
import { unpublishArtwork } from '@/lib/services/artwork.service'

type Params = { params: Promise<{ id: string }> }

export async function POST(_req: Request, { params }: Params) {
  const { artist, error } = await requireArtist()
  if (error) return error

  try {
    const { id }  = await params
    const artwork = await unpublishArtwork(id, artist.id)
    return NextResponse.json(artwork)
  } catch (err) {
    return serviceErrorToResponse(err)
  }
}
