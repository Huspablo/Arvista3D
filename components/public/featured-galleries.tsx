import Link from 'next/link'
import { db } from '@/lib/db'

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
    <section className="bg-bg2 border-b border-(--border) px-15 py-12 max-md:px-6">
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

        <div className="grid grid-cols-3 gap-px bg-(--border) max-md:grid-cols-1">
          {galleries.map((g, i) => {
            const previews = g.slots.map(s => s.artwork?.assetThumbnail ?? null).filter(Boolean) as string[]
            return (
              <Link key={g.id} href={`/galleries/${g.slug}`}
                className={`bg-bg no-underline flex flex-col group reveal ${i < 3 ? `rd${i + 1}` : ''}`}>
                {/* Mosaic preview */}
                <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
                  {previews.length > 0 ? (
                    <div className={`w-full h-full grid gap-px ${previews.length >= 3 ? 'grid-cols-3' : previews.length === 2 ? 'grid-cols-2' : ''}`}>
                      {(previews.length >= 3 ? previews.slice(0, 3) : previews).map((src, idx) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={idx} src={src} alt=""
                          className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04]" />
                      ))}
                    </div>
                  ) : (
                    <div className="w-full h-full bg-bg3 flex items-center justify-center">
                      <span className="font-serif text-[48px] opacity-10">◇</span>
                    </div>
                  )}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-350 flex flex-col justify-end p-4"
                    style={{ background: 'linear-gradient(to top, oklch(97.5% 0.007 75 / .9) 0%, transparent 55%)' }}>
                    <span className="text-[12px] tracking-[2px] uppercase text-gold font-medium">Visitar →</span>
                  </div>
                </div>

                {/* Info */}
                <div className="px-5 py-5 border-t border-(--border) flex flex-col gap-2">
                  <h3 className="font-serif text-[20px] font-bold leading-tight">{g.name}</h3>
                  {g.description && (
                    <p className="text-[13px] text-ink3 leading-snug line-clamp-2">{g.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-auto pt-3 border-t border-(--border)">
                    {g.artist.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={g.artist.avatarUrl} alt={g.artist.name}
                        className="w-6 h-6 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-bg3 flex items-center justify-center shrink-0">
                        <span className="text-[10px] text-ink3">{g.artist.name[0]?.toUpperCase()}</span>
                      </div>
                    )}
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
