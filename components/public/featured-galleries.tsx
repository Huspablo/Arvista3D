import Link from 'next/link'
import { db } from '@/lib/db'
import { ArtistAvatar } from '@/components/ui/artist-avatar'
import { GalleryPreviewMosaic } from '@/components/ui/gallery-preview-mosaic'
import { FrameCorners } from '@/components/ui/frame-corners'

export async function FeaturedGalleries() {
  const galleries = await db.gallery.findMany({
    where: { visibility: 'PUBLIC' },
    orderBy: [
      { slots: { _count: 'desc' } },
      { createdAt: 'desc' },
    ],
    take: 3,
    select: {
      id:          true,
      name:        true,
      description: true,
      slug:        true,
      artist: { select: { id: true, name: true, avatarUrl: true } },
      _count: { select: { slots: { where: { artworkId: { not: null } } } } },
      slots: {
        where:   { artworkId: { not: null } },
        orderBy: { position: 'asc' },
        take: 3,
        select:  { artwork: { select: { assetThumbnail: true } } },
      },
    },
  })

  if (galleries.length === 0) return null

  return (
    <section className="border-b border-(--border) px-15 py-12 max-md:px-6">
      <div className="max-w-370 mx-auto">
        <div className="flex items-end justify-between mb-8 reveal">
          <div>
            <span className="text-[11px] tracking-[5px] uppercase text-gold mb-2 block">Selección</span>
            <h2 className="font-serif font-bold" style={{ fontSize: 'clamp(22px, 2.5vw, 36px)' }}>
              Galerías <em className="italic text-gold">destacadas</em>
            </h2>
          </div>
          <a href="#catalog" className="text-[13px] text-ink3 no-underline hover:text-ink transition-colors">
            Ver todas ↓
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 lg:gap-6">
          {galleries.map((g, i) => {
            const previews = g.slots.map(s => s.artwork?.assetThumbnail ?? null).filter(Boolean) as string[]
            return (
              <Link key={g.id} href={`/galleries/${g.slug}`}
                className={`bg-bg no-underline flex flex-col group reveal transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_16px_48px_oklch(0%_0_0/0.12)] ${i < 3 ? `rd${i + 1}` : ''}`}
                style={{ boxShadow: '0 2px 8px oklch(0% 0 0 / 0.06)' }}>

                {/* Framed mosaic */}
                <div className="p-2.5" style={{ background: 'oklch(13% 0.010 75)' }}>
                  <div className="relative overflow-hidden aspect-4/3">
                    <GalleryPreviewMosaic images={previews} emptyBg="bg-[oklch(18%_0.010_75)]" />
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-350 flex flex-col justify-end p-4 z-20"
                      style={{ background: 'linear-gradient(to top, oklch(10% 0.010 75 / .85) 0%, transparent 55%)' }}
                    >
                      <span className="text-[11px] tracking-[3px] uppercase text-gold font-medium">Visitar galería →</span>
                    </div>
                    <FrameCorners size={24} opacity={0.65} />
                  </div>
                </div>

                {/* Info */}
                <div className="px-5 py-5 flex flex-col gap-2">
                  <h3 className="font-serif text-[20px] font-bold leading-tight">{g.name}</h3>
                  {g.description && (
                    <p className="text-[13px] text-ink3 leading-snug line-clamp-2">{g.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-auto pt-3 border-t border-(--border)">
                    <div className="w-6 h-6 rounded-full shrink-0 overflow-hidden">
                      <ArtistAvatar url={g.artist.avatarUrl} name={g.artist.name} size={24} />
                    </div>
                    <span className="text-[12px] text-ink3">{g.artist.name}</span>
                    <span className="ml-auto text-[11px] text-ink3">{g._count.slots} obra{g._count.slots !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
