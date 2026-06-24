import { NextResponse }     from 'next/server'
import { PutObjectCommand }  from '@aws-sdk/client-s3'
import { getSignedUrl }      from '@aws-sdk/s3-request-presigner'
import { r2, R2_BUCKET }     from '@/lib/r2'
import { requireArtist, serviceErrorToResponse } from '@/lib/api-helpers'
import { db }                from '@/lib/db'
import { z }                 from 'zod'

const Schema = z.object({
  artworkId:   z.string().min(1),
  filename:    z.string().min(1).max(200),
  contentType: z.string().regex(/^image\/(jpeg|jpg|png|webp|gif)$/),
})

export async function POST(req: Request) {
  const { artist, error } = await requireArtist()
  if (error) return error

  try {
    const body   = await req.json()
    const parsed = Schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const { artworkId, filename, contentType } = parsed.data

    // Verificar que la obra pertenece al artista
    const artwork = await db.artwork.findFirst({ where: { id: artworkId, artistId: artist.id } })
    if (!artwork) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })

    // Clave en R2: artworks/{artworkId}/original/{filename}
    const ext = filename.split('.').pop() ?? 'jpg'
    const key = `artworks/${artworkId}/original/${Date.now()}.${ext}`

    const url = await getSignedUrl(
      r2,
      new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, ContentType: contentType }),
      { expiresIn: 300 }, // 5 minutos
    )

    return NextResponse.json({ url, key })
  } catch (err) {
    return serviceErrorToResponse(err)
  }
}
