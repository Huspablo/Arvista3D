import { NextResponse } from 'next/server'
import { requireArtist, serviceErrorToResponse } from '@/lib/api-helpers'
import { updateGallery, deleteGallery } from '@/lib/services/gallery.service'
import { UpdateGallerySchema } from '@/lib/schemas'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: Request, { params }: Params) {
  const { artist, error } = await requireArtist()
  if (error) return error

  try {
    const { id } = await params
    const body   = await req.json()
    const parsed = UpdateGallerySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
    }
    const updated = await updateGallery(id, artist.id, parsed.data)
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
    await deleteGallery(id, artist.id)
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    return serviceErrorToResponse(err)
  }
}
