import { NextResponse }     from 'next/server'
import { PutObjectCommand }  from '@aws-sdk/client-s3'
import sharp                 from 'sharp'
import { r2, R2_BUCKET, cdnUrl } from '@/lib/r2'
import { requireArtist, serviceErrorToResponse } from '@/lib/api-helpers'
import { db }               from '@/lib/db'
import { inngest }          from '@/lib/inngest'

// La subida de artworks va siempre a través del servidor para evitar
// el error CORS que provoca el PUT directo desde el navegador a R2.
// El bucket R2 solo permite peticiones S3 firmadas desde el servidor.

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'])
const MAX_BYTES     = 20 * 1024 * 1024 // 20 MB

export async function POST(req: Request) {
  const { artist, error } = await requireArtist()
  if (error) return error

  try {
    const formData  = await req.formData()
    const file      = formData.get('file')      as File   | null
    const artworkId = formData.get('artworkId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó ningún archivo' }, { status: 400 })
    }
    if (!artworkId) {
      return NextResponse.json({ error: 'Falta el identificador de la obra' }, { status: 400 })
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Formato no permitido. Usa JPG, PNG, WebP o GIF.' }, { status: 400 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'La imagen no puede superar 20 MB' }, { status: 400 })
    }

    // Verificar que la obra pertenece al artista autenticado
    const artwork = await db.artwork.findFirst({ where: { id: artworkId, artistId: artist.id } })
    if (!artwork) {
      return NextResponse.json({ error: 'Obra no encontrada o sin permisos' }, { status: 403 })
    }

    const ext    = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const key    = `artworks/${artworkId}/original/${Date.now()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    // 1. Subir el original a R2
    await r2.send(new PutObjectCommand({
      Bucket:      R2_BUCKET,
      Key:         key,
      Body:        buffer,
      ContentType: file.type,
      CacheControl:'public, max-age=31536000, immutable',
    }))

    // 2. Generar miniatura (400px) y derivado de galería (1200px) síncronamente.
    //    Inngest sobreescribirá estas claves cuando se ejecute (mismo path).
    //    Así la textura 3D siempre está disponible sin depender del servidor Inngest.
    const thumbnailKey = `artworks/${artworkId}/thumbnail.webp`
    const galleryKey   = `artworks/${artworkId}/gallery.webp`

    const [thumbnailBuffer, galleryBuffer] = await Promise.all([
      sharp(buffer)
        .resize(400, 400, { fit: 'cover',  withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer(),
      sharp(buffer)
        .resize(1200, 900, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer(),
    ])

    await Promise.all([
      r2.send(new PutObjectCommand({
        Bucket: R2_BUCKET, Key: thumbnailKey, Body: thumbnailBuffer,
        ContentType: 'image/webp', CacheControl: 'public, max-age=31536000, immutable',
      })),
      r2.send(new PutObjectCommand({
        Bucket: R2_BUCKET, Key: galleryKey, Body: galleryBuffer,
        ContentType: 'image/webp', CacheControl: 'public, max-age=31536000, immutable',
      })),
    ])

    const thumbnailUrl = cdnUrl(thumbnailKey)
    const galleryUrl   = cdnUrl(galleryKey)

    // 3. Persistir original + thumbnail + gallery en BD
    await db.artwork.update({
      where: { id: artworkId },
      data:  { assetOriginalKey: key, assetThumbnail: thumbnailUrl, assetGallery: galleryUrl },
    })

    // 4. Disparar Inngest para generar los derivados de galería y detalle (async).
    //    No es crítico: si Inngest no está activo en desarrollo la miniatura ya está lista.
    try {
      await inngest.send({
        name: 'artwork/uploaded',
        data: { artworkId, artistId: artist.id, originalKey: key, contentType: file.type },
      })
    } catch {
      // Inngest no disponible (ej. en desarrollo sin dev-server). La miniatura ya fue guardada.
    }

    return NextResponse.json({ key, thumbnailUrl, ok: true })
  } catch (err) {
    return serviceErrorToResponse(err)
  }
}
