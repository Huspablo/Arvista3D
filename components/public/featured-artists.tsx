import Link from 'next/link'
import { db } from '@/lib/db'

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
    // Ordenar los que más obras tienen primero
    orderBy: { artworks: { _count: 'desc' } },
    take: 3,
  })

  if (artists.length === 0) return null

  return (
    <section className="bg-bg2 border-b border-(--border) px-15 py-12 max-md:px-6">
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

        <div className="grid grid-cols-3 gap-px bg-(--border) max-md:grid-cols-1">
          {artists.map((a, i) => {
            const initials = a.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || '?'
            return (
              <Link key={a.id} href={`/artists/${a.id}`}
                className={`bg-bg no-underline px-6 py-7 flex flex-col gap-5 group reveal ${i < 3 ? `rd${i + 1}` : ''}`}>
                {/* Avatar + nombre */}
                <div className="flex items-center gap-4">
                  {a.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.avatarUrl} alt={a.name}
                      className="w-14 h-14 rounded-full object-cover shrink-0 transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div
                      className="w-14 h-14 rounded-full shrink-0 flex items-center justify-center font-serif font-bold text-[20px]"
                      style={{
                        background: 'radial-gradient(ellipse at 25% 75%, oklch(68% .10 300), oklch(84% .14 82))',
                        color:      'oklch(94% 0.008 75)',
                      }}
                    >
                      {initials}
                    </div>
                  )}
                  <div>
                    <h3 className="font-serif text-[19px] font-bold leading-tight group-hover:text-gold transition-colors">
                      {a.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-ink3 mt-0.5">
                      <span>{a._count.galleries} galería{a._count.galleries !== 1 ? 's' : ''}</span>
                      <span className="text-(--border-md)">·</span>
                      <span>{a._count.artworks} obra{a._count.artworks !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {a.bio && (
                  <p className="text-[13px] text-ink3 leading-relaxed line-clamp-3">{a.bio}</p>
                )}

                {/* Galería principal */}
                {a.galleries[0] && (
                  <div className="mt-auto pt-4 border-t border-(--border) flex items-center justify-between">
                    <span className="text-[11px] tracking-[0.8px] text-gold border border-[oklch(60%_0.130_82/0.25)] px-1.5 py-0.5 rounded-xs">
                      ◇ {a.galleries[0].name}
                    </span>
                    <span className="text-[12px] text-gold opacity-0 group-hover:opacity-100 transition-opacity">Ver →</span>
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
