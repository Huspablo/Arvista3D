import { NextResponse }           from 'next/server'
import { requireArtist, serviceErrorToResponse } from '@/lib/api-helpers'
import { db }                       from '@/lib/db'
import { inngest }                  from '@/lib/inngest'
import { z }                        from 'zod'

const Schema = z.object({
  key:         z.string().min(1),
  contentType: z.string().min(1),
})

type Params = { params: Promise<{ id: string }> }

export async function POST(req: Request, { params }: Params) {
  const { artist, error } = await requireArtist()
  if (error) return error

  try {
    const { id } = await params
    const body   = await req.json()
    const parsed = Schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    // Verificar propiedad
    const artwork = await db.artwork.findFirst({ where: { id, artistId: artist.id } })
    if (!artwork) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })

    // Guardar la clave del original en BD
    await db.artwork.update({
      where: { id },
      data:  { assetOriginalKey: parsed.data.key },
    })

    // Disparar el job de procesamiento en Inngest
    await inngest.send({
      name: 'artwork/uploaded',
      data: {
        artworkId:   id,
        artistId:    artist.id,
        originalKey: parsed.data.key,
        contentType: parsed.data.contentType,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    return serviceErrorToResponse(err)
  }
}
