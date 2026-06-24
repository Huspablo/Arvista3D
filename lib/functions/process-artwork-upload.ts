import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { revalidateTag }  from 'next/cache'
import sharp              from 'sharp'
import { inngest } from '@/lib/inngest'
import { r2, R2_BUCKET, cdnUrl } from '@/lib/r2'
import { db }             from '@/lib/db'

// Derivados que genera el pipeline por cada imagen subida
const VARIANTS = [
  { suffix: 'thumbnail', width: 400,  height: 400,  fit: 'cover'    as const },
  { suffix: 'gallery',   width: 1200, height: 900,  fit: 'inside'   as const },
  { suffix: 'detail',    width: 2400, height: 1800, fit: 'inside'   as const },
]

export const processArtworkUpload = inngest.createFunction(
  {
    id:       'process-artwork-upload',
    name:     'Procesar imagen subida',
    triggers: [{ event: 'artwork/uploaded' }],
  },
  async ({ event, step }) => {
    const { artworkId, originalKey } = event.data

    // 1. Descargar el original de R2
    const originalBuffer = await step.run('download-original', async () => {
      const res  = await r2.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: originalKey }))
      const body = res.Body
      if (!body) throw new Error('Empty R2 response')

      // Convertir stream a Buffer
      const chunks: Uint8Array[] = []
      for await (const chunk of body as AsyncIterable<Uint8Array>) chunks.push(chunk)
      return Buffer.concat(chunks)
    })

    // 2. Generar derivados con Sharp y subirlos a R2
    const baseKey = originalKey.replace('/original/', '/').split('/').slice(0, -1).join('/')

    const assetKeys = await step.run('generate-and-upload-variants', async () => {
      const results: Record<string, string> = {}

      for (const v of VARIANTS) {
        const webpBuffer = await sharp(originalBuffer)
          .resize(v.width, v.height, { fit: v.fit, withoutEnlargement: true })
          .webp({ quality: 85 })
          .toBuffer()

        const key = `${baseKey}/${v.suffix}.webp`
        await r2.send(new PutObjectCommand({
          Bucket:      R2_BUCKET,
          Key:         key,
          Body:        webpBuffer,
          ContentType: 'image/webp',
          CacheControl:'public, max-age=31536000, immutable',
        }))

        results[v.suffix] = key
      }

      return results
    })

    // 3. Actualizar la obra en BD con las URLs de CDN
    const artwork = await step.run('update-artwork-assets', async () => {
      return db.artwork.update({
        where: { id: artworkId },
        data:  {
          assetThumbnail: cdnUrl(assetKeys.thumbnail),
          assetGallery:   cdnUrl(assetKeys.gallery),
          assetDetail:    cdnUrl(assetKeys.detail),
        },
        include: { slot: { select: { galleryId: true } } },
      })
    })

    // 4. Invalidar manifest si la obra está expuesta en una galería
    await step.run('invalidate-manifest-cache', async () => {
      if (artwork.slot?.galleryId) {
        revalidateTag(`manifest-${artwork.slot.galleryId}`, {})
      }
    })

    return { artworkId, variants: assetKeys }
  },
)
