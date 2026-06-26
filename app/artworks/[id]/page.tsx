import { notFound }          from 'next/navigation'
import { Nav }                from '@/components/layout/nav'
import { Footer }             from '@/components/layout/footer'
import { ArtworkImageZone }   from '@/components/artwork/artwork-image-zone'
import { ArtworkInfoPanel }   from '@/components/artwork/artwork-info-panel'
import { ScrollReveal }       from '@/components/ui/scroll-reveal'
import Link                   from 'next/link'
import { db }                 from '@/lib/db'
import { TYPE_LABEL }         from '@/lib/labels'

export default async function ArtworkPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const artwork = await db.artwork.findFirst({
    where: {
      id,
      status: 'EXPOSED',
      slot:   { gallery: { visibility: 'PUBLIC' } },
    },
    include: {
      artist: { select: { id: true, name: true } },
      slot:   { select: { gallery: { select: { name: true, slug: true } } } },
    },
  })

  if (!artwork) notFound()

  // viewCount se incrementa cada visita a la página pública (fire-and-forget)
  db.artwork.update({ where: { id }, data: { viewCount: { increment: 1 } } }).catch(() => null)

  // assetDetail/Gallery/Thumbnail son derivados de resolución de la misma imagen,
  // no vistas distintas de la obra. Usamos solo el de mayor calidad disponible.
  const primaryAsset = artwork.assetDetail ?? artwork.assetGallery ?? artwork.assetThumbnail
  const arts = primaryAsset ? [primaryAsset] : []

  // Formatear dimensiones
  const dims = artwork.dimWidth && artwork.dimHeight
    ? `${artwork.dimWidth} × ${artwork.dimHeight}${artwork.dimDepth ? ` × ${artwork.dimDepth}` : ''} cm`
    : ''

  const galleryName = artwork.slot?.gallery.name ?? null
  const gallerySlug = artwork.slot?.gallery.slug ?? null

  return (
    <>
      <Nav />

      {/*
        Wrapper: cubre exactamente el viewport por debajo de la Nav fija.
        En desktop (md+): h-dvh bloquea al viewport, sin scroll de documento por encima del footer.
        En móvil: altura natural, scroll de documento normal.
      */}
      <div className="flex flex-col pt-14.25 md:h-dvh md:overflow-hidden">

        {/* Breadcrumb */}
        <nav className="shrink-0 px-15 py-3.5 flex items-center gap-2.5 text-[13px] text-ink3 border-b border-(--border) max-md:px-6">
          <Link href="/obras" className="text-ink3 no-underline hover:text-ink transition-colors">
            Obras
          </Link>
          <span className="text-(--border-md)">/</span>
          {galleryName && gallerySlug && (
            <>
              <Link href={`/galleries/${gallerySlug}`} className="text-ink3 no-underline hover:text-ink transition-colors">
                {galleryName}
              </Link>
              <span className="text-(--border-md)">/</span>
            </>
          )}
          <span className="text-ink">{artwork.title}</span>
        </nav>

        {/* Grid principal: ocupa el espacio restante */}
        <div className="md:flex-1 md:min-h-0 md:grid md:grid-cols-[1fr_400px]">
          <ArtworkImageZone arts={arts} title={artwork.title} />
          <ArtworkInfoPanel
            artwork={{
              title:       artwork.title,
              artist:      artwork.artist.name,
              artistId:    artwork.artist.id,
              type:        TYPE_LABEL[artwork.type] ?? artwork.type,
              year:        artwork.year ?? 0,
              dims,
              technique:   artwork.technique  ?? '',
              edition:     artwork.edition    ?? '',
              gallery:     galleryName,
              gallerySlug,
              description: artwork.description,
            }}
          />
        </div>
      </div>

      {/* Footer — bajo el fold en desktop, accesible scrolleando */}
      <Footer />
      <ScrollReveal />
    </>
  )
}
