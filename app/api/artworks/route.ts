import { NextResponse } from 'next/server'
import { requireArtist, serviceErrorToResponse } from '@/lib/api-helpers'
import { createArtwork, listArtworksByArtist } from '@/lib/services/artwork.service'
import { CreateArtworkSchema } from '@/lib/schemas'

export async function GET() {
  const { artist, error } = await requireArtist()
  if (error) return error

  try {
    const artworks = await listArtworksByArtist(artist.id)
    return NextResponse.json(artworks)
  } catch (err) {
    return serviceErrorToResponse(err)
  }
}

export async function POST(req: Request) {
  const { artist, error } = await requireArtist()
  if (error) return error

  try {
    const body   = await req.json()
    const parsed = CreateArtworkSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
    }
    const artwork = await createArtwork(artist.id, parsed.data)
    return NextResponse.json(artwork, { status: 201 })
  } catch (err) {
    return serviceErrorToResponse(err)
  }
}
