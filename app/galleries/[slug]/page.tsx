import { notFound }         from 'next/navigation'
import { auth }              from '@clerk/nextjs/server'
import Link                  from 'next/link'
import { Nav }               from '@/components/layout/nav'
import { Footer }            from '@/components/layout/footer'
import { GalleryMasonry }    from '@/components/gallery/gallery-masonry'
import { ArtistBar }         from '@/components/gallery/artist-bar'
import { ShareButton }       from '@/components/gallery/share-button'
import { ScrollReveal }      from '@/components/ui/scroll-reveal'
import { ArtistAvatar }      from '@/components/ui/artist-avatar'
import { getGalleryBySlug }  from '@/lib/services/gallery.service'
import type { FloorMaterial } from '@prisma/client'
import { TYPE_LABEL }         from '@/lib/labels'

const TEMPLATE_LABEL: Record<string, string> = {
  'white-cube-8': 'White Cube',
  'long-hall':    'Long Hall',
  'open-room':    'Open Room',
}

const FLOOR_LABEL = {
  CONCRETE: 'Hormigón',
  PARQUET:  'Parquet',
  MARBLE:   'Mármol',
} satisfies Record<FloorMaterial, string>

// Distribución de grid para hasta 8 obras
const GRID_POSITIONS = [
  { gridCol: '1/6',   gridRow: '1/9'  },
  { gridCol: '6/9',   gridRow: '1/5'  },
  { gridCol: '9/13',  gridRow: '1/7'  },
  { gridCol: '6/10',  gridRow: '5/9'  },
  { gridCol: '10/13', gridRow: '7/9'  },
  { gridCol: '1/5',   gridRow: '9/15' },
  { gridCol: '5/9',   gridRow: '9/13' },
  { gridCol: '9/13',  gridRow: '9/15' },
]

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug }  = await params
  const gallery   = await getGalleryBySlug(slug)

  if (!gallery) notFound()

  // El propietario puede ver su galería aunque sea privada (vista previa)
  const { userId } = await auth()
  const isOwner    = userId === gallery.artist.clerkId

  if (gallery.visibility === 'PRIVATE' && !isOwner) notFound()

  const isPreview     = isOwner && gallery.visibility === 'PRIVATE'
  const isPublic      = gallery.visibility === 'PUBLIC'
  const templateLabel = TEMPLATE_LABEL[gallery.templateKey] ?? null
  const floorLabel    = FLOOR_LABEL[gallery.floorMaterial]  ?? null
  const hasMetadata   = templateLabel || floorLabel || gallery.wallColor

  // Obras expuestas en los slots de esta galería
  const exposedArtworks = gallery.slots
    .filter(s => s.artwork !== null)
    .map((s, i) => ({
      id:        s.artwork!.id,
      title:     s.artwork!.title,
      type:      TYPE_LABEL[s.artwork!.type] ?? s.artwork!.type,
      year:      s.artwork!.year ?? 0,
      thumbnail: s.artwork!.assetThumbnail ?? null,
      gridCol:   GRID_POSITIONS[i % GRID_POSITIONS.length].gridCol,
      gridRow:   GRID_POSITIONS[i % GRID_POSITIONS.length].gridRow,
    }))

  return (
    <>
      <Nav />

      {/* Banner de vista previa — solo para el propietario de galería privada */}
      {isPreview && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-250 flex items-center gap-4 px-5 py-3 rounded-xs"
          style={{
            background:     'oklch(14% 0.010 75 / 0.94)',
            backdropFilter: 'blur(24px)',
            boxShadow:      '0 8px 40px oklch(14% 0.010 75 / .22)',
          }}
        >
          <span className="text-[9px] tracking-[2.5px] uppercase text-gold shrink-0">◈ Vista previa</span>
          <span className="w-px h-3 shrink-0" style={{ background: 'oklch(78% 0.008 75 / .18)' }} />
          <span className="text-[12px] max-md:hidden" style={{ color: 'oklch(65% 0.008 75)' }}>
            Esta galería no es visible para el público
          </span>
          <Link
            href="/dashboard/galleries"
            className="text-[11px] px-3.5 py-1.25 rounded-xs no-underline transition-colors shrink-0"
            style={{
              border:     '1px solid oklch(60% 0.130 82 / .30)',
              background: 'oklch(60% 0.130 82 / .08)',
              color:      'var(--color-gold)',
            }}
          >
            Publicar →
          </Link>
        </div>
      )}

      {/* ── Layout principal: sidebar info + obras ── */}
      <main className="pt-14.25 border-b border-(--border)">

        <div className="grid grid-cols-1 md:grid-cols-[264px_1fr] items-start gap-10 px-15 py-10 max-w-370 mx-auto max-md:px-6 max-md:py-8 max-md:gap-8">

          {/* Sidebar: info de la galería */}
          <aside
            className="md:sticky md:top-20 flex flex-col relative md:pl-5 md:[border-left-width:3px] md:[border-left-style:solid]"
            style={{ borderLeftColor: gallery.wallColor ?? 'oklch(60% 0.130 82 / .55)' }}
          >

            {/* Símbolo ◈ de fondo — identidad visual de galería */}
            <span
              className="absolute top-0 right-0 font-serif font-black leading-none select-none pointer-events-none max-md:hidden"
              style={{
                fontSize: '100px',
                color:    gallery.wallColor
                  ? `${gallery.wallColor}28`
                  : 'oklch(60% 0.130 82 / .08)',
              }}
              aria-hidden="true"
            >
              ◈
            </span>

            <span className="text-[11px] tracking-[5px] uppercase text-gold mb-4 block reveal">
              {isPreview ? 'Vista previa — Galería privada' : 'Galería pública'}
            </span>

            <h1
              className="font-serif font-black leading-[.92] mb-4 reveal rd1"
              style={{ fontSize: 'clamp(28px, 3.5vw, 54px)' }}
            >
              {gallery.name}
            </h1>

            {gallery.description && (
              <p className="font-serif italic text-[14px] leading-[1.8] text-ink2 mb-4 reveal rd2">
                {gallery.description}
              </p>
            )}

            <div className="flex items-center gap-3 text-[13px] text-ink3 reveal rd2">
              <div className="w-7 h-7 rounded-full shrink-0 border-[1.5px] border-(--border-md) overflow-hidden">
                <ArtistAvatar url={gallery.artist.avatarUrl} name={gallery.artist.name} size={28} />
              </div>
              <span>
                Por{' '}
                <Link href={`/artists/${gallery.artist.id}`} className="text-ink no-underline border-b border-(--border-md) hover:border-gold transition-colors">
                  {gallery.artist.name}
                </Link>
              </span>
              <span className="w-px h-3 bg-(--border-md)" />
              <span>{exposedArtworks.length} obra{exposedArtworks.length !== 1 ? 's' : ''}</span>
            </div>

            {hasMetadata && (
              <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-(--border) reveal rd3">
                {templateLabel && (
                  <div className="flex items-center gap-1.5 text-[12px] text-ink3">
                    <span className="opacity-40">◻</span>
                    <span>{templateLabel}</span>
                  </div>
                )}
                {floorLabel && (
                  <>
                    {templateLabel && <span className="w-px h-3 bg-(--border-md)" />}
                    <span className="text-[12px] text-ink3">Suelo · {floorLabel}</span>
                  </>
                )}
                {gallery.wallColor && (
                  <>
                    <span className="w-px h-3 bg-(--border-md)" />
                    <div className="flex items-center gap-2 text-[12px] text-ink3">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-(--border-md) shrink-0"
                        style={{ background: gallery.wallColor }}
                      />
                      <span>Pared</span>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col gap-2.5 mt-6 pt-5 border-t border-(--border) reveal rd4">
              <Link
                href={`/galleries/${slug}/viewer`}
                className="relative overflow-hidden text-[14px] px-6 py-3 rounded-xs bg-ink text-bg no-underline font-medium hover:-translate-y-px transition-all ease-[cubic-bezier(.22,1,.36,1)] group text-center"
              >
                <span className="absolute inset-0 bg-gold -translate-x-full group-hover:translate-x-0 transition-transform duration-400 ease-[cubic-bezier(.22,1,.36,1)]" />
                <span className="relative z-1">◈ Ver en 3D</span>
              </Link>
              <Link
                href={`/artists/${gallery.artist.id}`}
                className="text-[14px] px-6 py-3 border-[1.5px] border-(--border-md) rounded-xs text-ink no-underline hover:border-ink hover:-translate-y-px transition-all text-center"
              >
                Ver artista →
              </Link>
              <ShareButton isPublic={isPublic} />
            </div>

          </aside>

          {/* Obras */}
          <GalleryMasonry artworks={exposedArtworks} />

        </div>

        <ArtistBar
          artistId={gallery.artist.id}
          name={gallery.artist.name}
          bio={gallery.artist.bio}
          avatarUrl={gallery.artist.avatarUrl}
          website={gallery.artist.website ?? null}
          artworkCount={exposedArtworks.length}
          memberSince={gallery.artist.createdAt}
        />
      </main>

      <Footer />
      <ScrollReveal />
    </>
  )
}
