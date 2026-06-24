import { NextResponse }    from 'next/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { r2, R2_BUCKET, cdnUrl } from '@/lib/r2'
import { requireArtist, serviceErrorToResponse } from '@/lib/api-helpers'

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'])
const MAX_BYTES     = 5 * 1024 * 1024 // 5 MB

export async function POST(req: Request) {
  const { artist, error } = await requireArtist()
  if (error) return error

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó ningún archivo' }, { status: 400 })
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Formato no permitido. Usa JPG, PNG, WebP o GIF.' }, { status: 400 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'La imagen no puede superar 5 MB' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const key = `avatars/${artist.id}/${Date.now()}.${ext}`

    const buffer = Buffer.from(await file.arrayBuffer())

    await r2.send(new PutObjectCommand({
      Bucket:       R2_BUCKET,
      Key:          key,
      Body:         buffer,
      ContentType:  file.type,
      CacheControl: 'public, max-age=31536000, immutable',
    }))

    return NextResponse.json({ cdnUrl: cdnUrl(key) })
  } catch (err) {
    return serviceErrorToResponse(err)
  }
}
