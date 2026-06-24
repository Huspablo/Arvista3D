import { Nav }           from '@/components/layout/nav'
import { Footer }         from '@/components/layout/footer'
import { ObrasCatalog }   from '@/components/public/obras-catalog'
import { TopArtworks }    from '@/components/public/top-artworks'
import { ScrollReveal }   from '@/components/ui/scroll-reveal'

export const metadata = {
  title: 'Obras — Arvista 3D',
  description: 'Explora todas las obras expuestas en Arvista 3D.',
}

export default function ObrasPage() {
  return (
    <>
      <Nav />
      <div className="pt-14.25">
        <TopArtworks />
        <section id="catalog">
          <ObrasCatalog />
        </section>
      </div>
      <Footer />
      <ScrollReveal />
    </>
  )
}
