import { Nav }              from '@/components/layout/nav'
import { Footer }           from '@/components/layout/footer'
import { ScrollReveal }     from '@/components/ui/scroll-reveal'
import { HeroSection }      from '@/components/landing/hero-section'
import { TickerSection }    from '@/components/landing/ticker-section'
import { ManifestoSection }     from '@/components/landing/manifesto-section'
import { GalleryRoomsCollage }  from '@/components/landing/gallery-rooms-collage'
import { FeaturesSection }      from '@/components/landing/features-section'
import { CtaSection }       from '@/components/landing/cta-section'
import { ShowcaseGrid, ShowcaseEmpty } from '@/components/landing/showcase-section'
import { db }               from '@/lib/db'
import Link                 from 'next/link'

async function getFeaturedArtworks() {
  return db.artwork.findMany({
    where: {
      status: 'EXPOSED',
      slot:   { gallery: { visibility: 'PUBLIC' } },
    },
    orderBy: { viewCount: 'desc' },
    take:    6,
    select: {
      id:             true,
      title:          true,
      type:           true,
      assetGallery:   true,
      assetThumbnail: true,
      viewCount:      true,
      artist: { select: { name: true } },
      slot:   { select: { gallery: { select: { name: true, slug: true } } } },
    },
  })
}

export default async function LandingPage() {
  const featuredArtworks = await getFeaturedArtworks()

  return (
    <>
      <Nav transparent />
      <main>
        <HeroSection />
        <TickerSection />
        <ManifestoSection />
        <GalleryRoomsCollage />

        {/* ── Obras destacadas ── */}
        <section id="obras" className="py-30 px-15 max-w-370 mx-auto max-md:py-20 max-md:px-6">
          <div className="flex justify-between items-end border-b border-(--border) pb-7 mb-12 reveal max-md:flex-col max-md:items-start max-md:gap-4">
            <div>
              <span className="text-[11px] tracking-[6px] uppercase text-gold mb-5 block">Colección</span>
              <h2
                className="font-serif font-black leading-[.95]"
                style={{ fontSize: 'clamp(36px, 5vw, 68px)' }}
              >
                Obras <em className="italic text-gold">destacadas</em>
              </h2>
            </div>
            {featuredArtworks.length > 0 && (
              <Link
                href="/obras"
                className="text-ink2 text-[13px] tracking-[2px] no-underline uppercase border-b border-(--border-md) pb-0.5 hover:border-ink hover:text-ink transition-all whitespace-nowrap"
              >
                Ver catálogo →
              </Link>
            )}
          </div>

          {featuredArtworks.length > 0
            ? <ShowcaseGrid artworks={featuredArtworks} />
            : <ShowcaseEmpty />
          }
        </section>

        {/* ── Explora más ── */}
        <section className="py-20 px-15 max-md:py-14 max-md:px-6 border-t border-(--border)">
          <div className="max-w-370 mx-auto">
            <div className="reveal mb-10">
              <span className="text-[11px] tracking-[6px] uppercase text-gold mb-4 block">Descubre</span>
              <h2 className="font-serif font-black leading-[.95]" style={{ fontSize: 'clamp(28px, 4vw, 56px)' }}>
                Explora la plataforma
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-px bg-(--border) max-md:grid-cols-1">
              <Link
                href="/galleries"
                className="bg-bg px-10 py-10 max-md:px-6 max-md:py-8 no-underline group reveal rd1 hover:bg-bg2 transition-colors"
              >
                <span className="font-serif text-[48px] leading-none text-gold block mb-5 group-hover:scale-110 transition-transform origin-left">◈</span>
                <h3 className="font-serif font-bold mb-2" style={{ fontSize: 'clamp(22px, 2.5vw, 36px)' }}>
                  Galerías virtuales
                </h3>
                <p className="text-[14px] text-ink3 leading-[1.8] mb-6 max-w-80">
                  Explora exposiciones completas en 3D. Cada galería es un espacio único diseñado por el artista.
                </p>
                <span className="text-[13px] tracking-[2px] uppercase text-gold border-b border-[oklch(60%_0.130_82/0.35)] pb-0.5">
                  Ver galerías →
                </span>
              </Link>
              <Link
                href="/artists"
                className="bg-bg px-10 py-10 max-md:px-6 max-md:py-8 no-underline group reveal rd2 hover:bg-bg2 transition-colors"
              >
                <span className="font-serif text-[48px] leading-none text-gold block mb-5 group-hover:scale-110 transition-transform origin-left">◉</span>
                <h3 className="font-serif font-bold mb-2" style={{ fontSize: 'clamp(22px, 2.5vw, 36px)' }}>
                  Artistas
                </h3>
                <p className="text-[14px] text-ink3 leading-[1.8] mb-6 max-w-80">
                  Conoce a los creadores detrás de las obras. Conecta con artistas de distintas disciplinas.
                </p>
                <span className="text-[13px] tracking-[2px] uppercase text-gold border-b border-[oklch(60%_0.130_82/0.35)] pb-0.5">
                  Ver artistas →
                </span>
              </Link>
            </div>
          </div>
        </section>

        <FeaturesSection />
        <CtaSection />
      </main>
      <Footer />
      <ScrollReveal />
    </>
  )
}
