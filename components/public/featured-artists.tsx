import Link from 'next/link'
import { db } from '@/lib/db'
import { ArtistAvatar } from '@/components/ui/artist-avatar'

export async function FeaturedArtists() {
  const artists = await db.artist.findMany({
    where: {
      galleries: { some: { visibility: 'PUBLIC' } },
    },
    select: {
      id:        true,
      name:      true,
      bio:       true,
      avatarUrl: true,
      createdAt: true,
      galleries: {
        where:   { visibility: 'PUBLIC' },
        orderBy: { createdAt: 'desc' },
        take: 1,
        select:  { slug: true, name: true },
      },
      _count: {
        select: {
          galleries: { where: { visibility: 'PUBLIC' } },
          artworks:  { where: { status: 'EXPOSED' } },
        },
      },
    },
    orderBy: { artworks: { _count: 'desc' } },
    take: 3,
  })

  if (artists.length === 0) return null

  return (
    <section className="border-b border-(--border) px-15 py-12 max-md:px-6">
      <div className="max-w-370 mx-auto">
        <div className="flex items-end justify-between mb-8 reveal">
          <div>
            <span className="text-[11px] tracking-[5px] uppercase text-gold mb-2 block">Comunidad</span>
            <h2 className="font-serif font-bold" style={{ fontSize: 'clamp(22px, 2.5vw, 36px)' }}>
              Artistas <em className="italic text-gold">activos</em>
            </h2>
          </div>
          <a href="#catalog" className="text-[13px] text-ink3 no-underline hover:text-ink transition-colors">
            Ver todos ↓
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 lg:gap-6">
          {artists.map((a, i) => (
            <Link key={a.id} href={`/artists/${a.id}`}
              className={`bg-bg no-underline px-7 py-8 flex flex-col gap-5 group reveal transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_16px_48px_oklch(0%_0_0/0.12)] ${i < 3 ? `rd${i + 1}` : ''}`}
              style={{ boxShadow: '0 2px 8px oklch(0% 0 0 / 0.06)' }}>

              {/* Avatar con marco ornamental */}
              <div className="flex items-center gap-5">
                <div className="relative shrink-0">
                  <div className="p-1.5 rounded-full" style={{ background: 'oklch(13% 0.010 75)' }}>
                    <div className="w-16 h-16 rounded-full overflow-hidden ring-1 ring-[oklch(65%_0.130_82/0.5)] group-hover:ring-[oklch(65%_0.130_82/0.9)] transition-all duration-500">
                      <ArtistAvatar url={a.avatarUrl} name={a.name} size={64} />
                    </div>
                  </div>
                  {/* Pequeño ornamento dorado en la esquina del avatar */}
                  <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px]"
                    style={{ background: 'oklch(13% 0.010 75)', color: 'oklch(65% 0.130 82)', border: '1px solid oklch(65% 0.130 82 / 0.4)' }}>
                    ◆
                  </span>
                </div>
                <div>
                  <h3 className="font-serif text-[20px] font-bold leading-tight group-hover:text-gold transition-colors duration-300">
                    {a.name}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-ink3 mt-1">
                    <span>{a._count.galleries} galería{a._count.galleries !== 1 ? 's' : ''}</span>
                    <span className="text-(--border-md)">·</span>
                    <span>{a._count.artworks} obra{a._count.artworks !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {a.bio && (
                <p className="text-[13px] text-ink3 leading-relaxed line-clamp-3 border-t border-(--border) pt-4">{a.bio}</p>
              )}

              {/* Galería principal */}
              {a.galleries[0] && (
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-[11px] tracking-[0.8px] text-gold border border-[oklch(60%_0.130_82/0.25)] px-2 py-1 rounded-xs">
                    ◇ {a.galleries[0].name}
                  </span>
                  <span className="text-[12px] text-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300">Ver →</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
