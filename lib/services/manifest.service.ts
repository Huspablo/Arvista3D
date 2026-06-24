import { unstable_cache } from 'next/cache'
import { db } from '@/lib/db'
import { cdnUrl } from '@/lib/r2'
import type { GalleryManifest } from '@/types/manifest'

const manifestTag = (galleryId: string) => `manifest-${galleryId}`

async function _buildManifest(galleryId: string): Promise<GalleryManifest> {
  const gallery = await db.gallery.findUnique({
    where:   { id: galleryId },
    include: {
      artist: { select: { name: true } },
      slots:  {
        orderBy: { position: 'asc' },
        include: { artwork: { include: { artist: { select: { name: true } } } } },
      },
    },
  })

  if (!gallery) throw new Error('GALLERY_NOT_FOUND')

  return {
    gallery: {
      id:          gallery.id,
      name:        gallery.name,
      templateKey: gallery.templateKey,
      config: {
        wallColor:      gallery.wallColor      ?? undefined,
        floorMaterial:  gallery.floorMaterial.toLowerCase()  as 'concrete' | 'parquet' | 'marble',
        lightingPreset: gallery.lightingPreset.toLowerCase() as 'warm' | 'neutral' | 'dramatic',
      },
    },
    slots: gallery.slots.map(slot => {
      if (!slot.artwork) {
        return { id: slot.id, position: slot.position, displayMode: slot.displayMode, artwork: null }
      }

      const aw     = slot.artwork
      // assetThumbnail / assetGallery / assetDetail ya son URLs CDN completas
      // (guardadas así por el pipeline de Inngest). Solo assetModel es clave cruda.
      const assets = slot.displayMode === 'FLOOR_MODEL'
        ? { model: aw.assetModel ? cdnUrl(aw.assetModel) : '', thumbnail: aw.assetThumbnail ?? '' }
        : { thumbnail: aw.assetThumbnail ?? '', gallery: aw.assetGallery ?? '', detail: aw.assetDetail ?? '' }

      return {
        id:          slot.id,
        position:    slot.position,
        displayMode: slot.displayMode,
        artwork: {
          id:         aw.id,
          title:      aw.title,
          artistName: aw.artist.name,
          type:       aw.type,
          year:       aw.year ?? undefined,
          tags:       aw.tags,
          dimensions: (aw.dimWidth && aw.dimHeight)
            ? { width: aw.dimWidth, height: aw.dimHeight, depth: aw.dimDepth ?? undefined }
            : undefined,
          assets,
        },
      }
    }),
  }
}

// El manifest se cachea por galleryId y se invalida explícitamente
// cuando el artista publica, retira o modifica la configuración de la galería.
export function buildManifest(galleryId: string): Promise<GalleryManifest> {
  return unstable_cache(
    () => _buildManifest(galleryId),
    [galleryId],
    { tags: [manifestTag(galleryId)] },
  )()
}
