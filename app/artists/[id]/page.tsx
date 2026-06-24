import { notFound }  from 'next/navigation'
import Link           from 'next/link'
import { Nav }        from '@/components/layout/nav'
import { Footer }     from '@/components/layout/footer'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { db }         from '@/lib/db'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id }   = await params
  const artist   = await db.artist.findUnique({ where: { id }, select: { name: true, bio: true } })
  if (!artist) return {}
  return {
    title:       `${artist.name} — Arvista 3D`,
    description: artist.bio ?? `Perfil del artista ${artist.name} en Arvista 3D.`,
  }
}

export default async function ArtistProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const artist = await db.artist.findUnique({
    where: { id },
    select: {
      id:        true,
      name:      true,
      bio:       true,
      avatarUrl: true,
      website:   true,
      createdAt: true,
      galleries: {
        where:   { visibility: 'PUBLIC' },
        orderBy: { createdAt: 'desc' },
        select: {
          id:          true,
          name:        true,
          description: true,
          slug:        true,
          _count: { select: { slots: { where: { artworkId: { not: null } } } } },
          slots: {
            where:   { artworkId: { not: null } },
            orderBy: { position: 'asc' },
            take: 3,
            select: { artwork: { select: { assetThumbnail: true } } },
          },
        },
      },
      _count: {
        select: { artworks: { where: { status: 'EXPOSED' } } },
      },
    },
  })

  if (!artist) notFound()
  if (artist.galleries.length === 0) notFound()

  const initials = artist.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || '?'
  const memberYear = new Date(artist.createdAt).getFullYear()

  return (
    <>
      <Nav />
      <main className="pt-14.25">

        {/* ── Hero del artista ── */}
        <div className="border-b border-(--border)">
          <div className="px-15 py-14 max-w-370 mx-auto max-md:px-6 max-md:py-10">
            <span className="text-[11px] tracking-[5px] uppercase text-gold mb-8 block reveal">Perfil de artista</span>
            <div className="flex items-start gap-10 max-md:flex-col max-md:gap-6">

              {/* Avatar */}
              <div
                className="w-28 h-28 rounded-full shrink-0 overflow-hidden border-[3px] border-(--border-md) reveal"
                style={{ minWidth: '112px' }}
              >
                {artist.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={artist.avatarUrl} alt={artist.name} className="w-full h-full object-cover" />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center font-serif font-bold text-[32px]"
                    style={{
                      background: 'radial-gradient(ellipse at 25% 75%, oklch(68% .10 300), oklch(84% .14 82))',
                      color:      'oklch(94% 0.008 75)',
                    }}
                  >
                    {initials}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h1
                  className="font-serif font-black leading-[.92] mb-3 reveal rd1"
                  style={{ fontSize: 'clamp(36px, 5vw, 72px)' }}
                >
                  {artist.name}
                </h1>

                {artist.bio && (
                  <p className="text-[16px] leading-[1.8] text-ink2 max-w-160 mb-6 reveal rd2">
                    {artist.bio}
                  </p>
                )}

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-x-8 gap-y-5 reveal rd2">
                  <div>
                    <div className="font-serif text-[32px] font-black leading-none">{artist.galleries.length}</div>
                    <div className="text-[11px] tracking-[2px] uppercase text-ink3 mt-1">Galería{artist.galleries.length !== 1 ? 's' : ''}</div>
                  </div>
                  <div className="w-px h-10 bg-(--border-md) max-sm:hidden" />
                  <div>
                    <div className="font-serif text-[32px] font-black leading-none">{artist._count.artworks}</div>
                    <div className="text-[11px] tracking-[2px] uppercase text-ink3 mt-1">Obra{artist._count.artworks !== 1 ? 's' : ''}</div>
                  </div>
                  <div className="w-px h-10 bg-(--border-md) max-sm:hidden" />
                  <div>
                    <div className="font-serif text-[32px] font-black leading-none">{memberYear}</div>
                    <div className="text-[11px] tracking-[2px] uppercase text-ink3 mt-1">Miembro desde</div>
                  </div>
                </div>

                {/* Links */}
                <div className="flex items-center gap-4 mt-6 reveal rd3">
                  {artist.website && (
                    <Link
                      href={artist.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[13px] px-5 py-2.5 border border-(--border-md) rounded-xs text-ink no-underline hover:border-ink hover:-translate-y-px transition-all"
                    >
                      Sitio web →
                    </Link>
                  )}
                  <Link
                    href="/artists"
                    className="text-[13px] text-ink3 no-underline hover:text-ink transition-colors"
                  >
                    ← Todos los artistas
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Galerías del artista ── */}
        <div className="px-15 py-12 max-w-370 mx-auto max-md:px-6">
          <div className="flex items-end justify-between border-b border-(--border) pb-6 mb-10 reveal">
            <div>
              <span className="text-[11px] tracking-[5px] uppercase text-gold mb-3 block">Exposiciones</span>
              <h2 className="font-serif font-bold" style={{ fontSize: 'clamp(24px, 3vw, 42px)' }}>
                Galerías <em className="italic text-gold">virtuales</em>
              </h2>
            </div>
            <span className="text-[14px] text-ink3">{artist.galleries.length} galería{artist.galleries.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="grid gap-px bg-(--border)"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {artist.galleries.map((g, i) => {
              const previews = g.slots.map(s => s.artwork?.assetThumbnail ?? null).filter(Boolean) as string[]
              return (
                <Link key={g.id} href={`/galleries/${g.slug}`}
                  className={`bg-bg no-underline flex flex-col group reveal ${i > 0 && i < 4 ? `rd${i}` : ''}`}>
                  {/* Preview */}
                  <div className="relative overflow-hidden" style={{ aspectRatio: '3/2' }}>
                    {previews.length > 0 ? (
                      <div className={`w-full h-full grid gap-px ${previews.length >= 3 ? 'grid-cols-3' : previews.length === 2 ? 'grid-cols-2' : ''}`}>
                        {(previews.length >= 3 ? previews.slice(0, 3) : previews).map((src, idx) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img key={idx} src={src} alt=""
                            className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04]" />
                        ))}
                      </div>
                    ) : (
                      <div className="w-full h-full bg-bg2 flex items-center justify-center">
                        <span className="font-serif text-[48px] opacity-10">◇</span>
                      </div>
                    )}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-350 flex flex-col justify-end p-5"
                      style={{ background: 'linear-gradient(to top, oklch(97.5% 0.007 75 / .92) 0%, transparent 55%)' }}>
                      <span className="inline-flex items-center gap-2 text-[12px] tracking-[2px] uppercase text-gold font-medium">Visitar galería →</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="px-5 py-5 border-t border-(--border) flex flex-col gap-1.5">
                    <h3 className="font-serif text-[20px] font-bold leading-tight">{g.name}</h3>
                    {g.description && (
                      <p className="text-[13px] text-ink3 leading-snug line-clamp-2">{g.description}</p>
                    )}
                    <span className="text-[12px] text-ink3 mt-1">
                      {g._count.slots} obra{g._count.slots !== 1 ? 's' : ''} expuesta{g._count.slots !== 1 ? 's' : ''}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

      </main>
      <Footer />
      <ScrollReveal />
    </>
  )
}
