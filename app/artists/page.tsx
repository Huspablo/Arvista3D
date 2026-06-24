import { Nav }              from '@/components/layout/nav'
import { Footer }            from '@/components/layout/footer'
import { ArtistsCatalog }    from '@/components/public/artists-catalog'
import { FeaturedArtists }   from '@/components/public/featured-artists'
import { ScrollReveal }      from '@/components/ui/scroll-reveal'

export const metadata = {
  title: 'Artistas — Arvista 3D',
  description: 'Descubre los artistas que exponen su obra en Arvista 3D.',
}

export default function ArtistsPage() {
  return (
    <>
      <Nav />
      <div className="pt-14.25">
        <FeaturedArtists />
        <section id="catalog">
          <ArtistsCatalog />
        </section>
      </div>
      <Footer />
      <ScrollReveal />
    </>
  )
}
