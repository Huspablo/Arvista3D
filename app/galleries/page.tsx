import { Nav }                from '@/components/layout/nav'
import { Footer }              from '@/components/layout/footer'
import { GalleriesCatalog }    from '@/components/public/galleries-catalog'
import { FeaturedGalleries }   from '@/components/public/featured-galleries'
import { ScrollReveal }        from '@/components/ui/scroll-reveal'

export const metadata = {
  title: 'Galerías — Arvista 3D',
  description: 'Explora las galerías virtuales de todos los artistas en Arvista 3D.',
}

export default function GalleriesPage() {
  return (
    <>
      <Nav />
      <div className="pt-14.25">
        <FeaturedGalleries />
        <section id="catalog">
          <GalleriesCatalog />
        </section>
      </div>
      <Footer />
      <ScrollReveal />
    </>
  )
}
