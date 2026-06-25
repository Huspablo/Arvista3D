import { NextResponse } from 'next/server'
import { requireArtist, serviceErrorToResponse } from '@/lib/api-helpers'
import { updateArtist } from '@/lib/services/artist.service'
import { UpdateArtistSchema } from '@/lib/schemas'

export async function GET() {
  const { artist, error } = await requireArtist()
  if (error) return error
  // Omitir campos internos de facturación y autenticación antes de enviar al cliente
  const { stripeCustomerId: _sc, stripeSubscriptionId: _ss, clerkId: _ck, ...safeArtist } = artist
  return NextResponse.json(safeArtist)
}

export async function PATCH(req: Request) {
  const { artist, error } = await requireArtist()
  if (error) return error

  try {
    const body   = await req.json()
    const parsed = UpdateArtistSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
    }
    const updated = await updateArtist(artist.id, parsed.data)
    return NextResponse.json(updated)
  } catch (err) {
    return serviceErrorToResponse(err)
  }
}
