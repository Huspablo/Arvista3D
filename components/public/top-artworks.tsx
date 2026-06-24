import Link from 'next/link'
import { db } from '@/lib/db'
import { TYPE_LABEL } from '@/lib/labels'

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

        <div className="grid gap-px bg-(--border)"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
          {artworks.map((a, i) => (
            <Link key={a.id} href={`/artworks/${a.id}`}
              className={`bg-bg no-underline flex flex-col group reveal ${i < 3 ? `rd${i + 1}` : ''}`}>
              {/* Imagen */}
              <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
                {a.assetThumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.assetThumbnail} alt={a.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.05]" />
                ) : (
                  <div className="w-full h-full bg-bg3 flex items-center justify-center">
                    <span className="font-serif text-[36px] opacity-10">◇</span>
                  </div>
                )}
                {/* Badge de vistas */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-xs text-[11px] font-medium"
                  style={{ background: 'oklch(14% 0.010 75 / 0.82)', backdropFilter: 'blur(8px)', color: 'oklch(94% 0.008 75)' }}>
                  <span className="opacity-60">◉</span>
                  {a.viewCount.toLocaleString('es')}
                </div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-350 flex flex-col justify-end p-4"
                  style={{ background: 'linear-gradient(to top, oklch(97.5% 0.007 75 / .9) 0%, transparent 55%)' }}>
                  <span className="text-[12px] tracking-[2px] uppercase text-gold font-medium">Ver obra →</span>
                </div>
              </div>

              {/* Info */}
              <div className="px-4 py-4 border-t border-(--border)">
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
