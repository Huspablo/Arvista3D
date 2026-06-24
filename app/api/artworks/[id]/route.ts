import { NextResponse } from 'next/server'
import { requireArtist, serviceErrorToResponse } from '@/lib/api-helpers'
import { updateArtwork, deleteArtwork } from '@/lib/services/artwork.service'
import { UpdateArtworkSchema } from '@/lib/schemas'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: Request, { params }: Params) {
  const { artist, error } = await requireArtist()
  if (error) return error

  try {
    const { id } = await params
    const body   = await req.json()
    const parsed = UpdateArtworkSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
    }
    const updated = await updateArtwork(id, artist.id, parsed.data)
    return NextResponse.json(updated)
  } catch (err) {
    return serviceErrorToResponse(err)
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { artist, error } = await requireArtist()
  if (error) return error

  try {
    const { id } = await params
    await deleteArtwork(id, artist.id)
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    return serviceErrorToResponse(err)
  }
}
