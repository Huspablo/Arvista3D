import Image from 'next/image'
import Link from 'next/link'
import { db } from '@/lib/db'
import { TYPE_LABEL } from '@/lib/labels'
import { FrameCorners } from '@/components/ui/frame-corners'

export async function TopArtworks() {
  const artworks = await db.artwork.findMany({
    where: {
      status:   'EXPOSED',
      viewCount: { gt: 0 },
      slot:     { gallery: { visibility: 'PUBLIC' } },
    },
    orderBy: { viewCount: 'desc' },
    take: 4,
    select: {
      id:             true,
      title:          true,
      type:           true,
      year:           true,
      viewCount:      true,
      assetThumbnail: true,
      artist: { select: { id: true, name: true } },
      slot:   { select: { gallery: { select: { name: true, slug: true } } } },
    },
  })

  if (artworks.length === 0) return null

  return (
    <section className="bg-bg2 border-b border-(--border) px-15 py-12 max-md:px-6">
      <div className="max-w-370 mx-auto">
        <div className="flex items-end justify-between mb-8 reveal">
          <div>
            <span className="text-[11px] tracking-[5px] uppercase text-gold mb-2 block">Tendencia</span>
            <h2 className="font-serif font-bold" style={{ fontSize: 'clamp(22px, 2.5vw, 36px)' }}>
              Obras más <em className="italic text-gold">vistas</em>
            </h2>
          </div>
          <a href="#catalog" className="text-[13px] text-ink3 no-underline hover:text-ink transition-colors">
            Ver catálogo ↓
          </a>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {artworks.map((a, i) => (
            <Link key={a.id} href={`/artworks/${a.id}`}
              className={`bg-bg no-underline flex flex-col group reveal transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_16px_48px_oklch(0%_0_0/0.12)] ${i < 3 ? `rd${i + 1}` : ''}`}
              style={{ boxShadow: '0 2px 8px oklch(0% 0 0 / 0.06)' }}>
              {/* Framed image */}
              <div className="p-2" style={{ background: 'oklch(13% 0.010 75)' }}>
                <div className="relative overflow-hidden aspect-4/3">
                  {a.assetThumbnail ? (
                    <Image src={a.assetThumbnail} alt={a.title} fill
                      sizes="(max-width: 768px) 100vw, 300px"
                      className="object-cover transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04]" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: 'oklch(18% 0.010 75)' }}>
                      <span className="font-serif text-[36px] opacity-10 text-[oklch(80%_0.05_75)]">◇</span>
                    </div>
                  )}
                  {/* Badge de vistas */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-xs text-[11px] font-medium z-20"
                    style={{ background: 'oklch(14% 0.010 75 / 0.82)', backdropFilter: 'blur(8px)', color: 'oklch(94% 0.008 75)' }}>
                    <span className="opacity-60">◉</span>
                    {a.viewCount.toLocaleString('es')}
                  </div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-350 flex flex-col justify-end p-4 z-20"
                    style={{ background: 'linear-gradient(to top, oklch(10% 0.010 75 / .85) 0%, transparent 55%)' }}>
                    <span className="text-[11px] tracking-[3px] uppercase text-gold font-medium">Ver obra →</span>
                  </div>
                  <FrameCorners size={24} opacity={0.65} />
                </div>
              </div>

              {/* Info */}
              <div className="px-4 py-4">
                <h3 className="font-serif text-[17px] font-bold leading-tight mb-1">{a.title}</h3>
                <div className="flex items-center gap-1.5 text-[11px] text-ink3">
                  <span className="tracking-[1.5px] uppercase">{TYPE_LABEL[a.type]}</span>
                  <span className="text-(--border-md)">·</span>
                  <span className="text-ink3">{a.artist.name}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
