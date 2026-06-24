import { NextResponse }    from 'next/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl }     from '@aws-sdk/s3-request-presigner'
import { r2, R2_BUCKET, cdnUrl } from '@/lib/r2'
import { requireArtist, serviceErrorToResponse } from '@/lib/api-helpers'
import { z } from 'zod'

const Schema = z.object({
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

    const { filename, contentType } = parsed.data
    const ext = filename.split('.').pop() ?? 'jpg'
    const key = `avatars/${artist.id}/${Date.now()}.${ext}`

    const url = await getSignedUrl(
      r2,
      new PutObjectCommand({
        Bucket:      R2_BUCKET,
        Key:         key,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable',
      }),
      { expiresIn: 300 },
    )

    return NextResponse.json({ url, cdnUrl: cdnUrl(key) })
  } catch (err) {
    return serviceErrorToResponse(err)
  }
}
