import { Nav }            from '@/components/layout/nav'
import { Footer }          from '@/components/layout/footer'
import { GalleryHero }     from '@/components/gallery/gallery-hero'
import { GalleryMasonry }  from '@/components/gallery/gallery-masonry'
import { ArtistBar }       from '@/components/gallery/artist-bar'
import { ScrollReveal }    from '@/components/ui/scroll-reveal'

interface Artwork {
  id:      string
  title:   string
  type:    string
  year:    number
  art:     string
  gridCol: string
  gridRow: string
}

const GALLERIES: Record<string, {
  name:     string
  artist:   string
  count:    number
  artworks: Artwork[]
}> = {
  'texturas-urbanas': {
    name:   'Texturas urbanas',
    artist: 'Mariana López',
    count:  8,
    artworks: [
      { id: '1', title: 'Espiral #3',  type: 'Escultura',   year: 2024, art: 'art-p1', gridCol: '1/6',   gridRow: '1/9'  },
      { id: '2', title: 'Bruma I',     type: 'Fotografía',  year: 2023, art: 'art-p2', gridCol: '6/9',   gridRow: '1/5'  },
      { id: '3', title: 'Agua & Luz',  type: 'Instalación', year: 2023, art: 'art-p3', gridCol: '9/13',  gridRow: '1/7'  },
      { id: '4', title: 'Raíz doble',  type: 'Pintura',     year: 2024, art: 'art-p4', gridCol: '6/10',  gridRow: '5/9'  },
      { id: '5', title: 'Vacío útil',  type: 'Video art',   year: 2023, art: 'art-p5', gridCol: '10/13', gridRow: '7/9'  },
      { id: '6', title: 'Textura #7',  type: 'Escultura',   year: 2024, art: 'art-p6', gridCol: '1/5',   gridRow: '9/15' },
      { id: '7', title: 'Luz baja',    type: 'Fotografía',  year: 2023, art: 'art-p7', gridCol: '5/9',   gridRow: '9/13' },
      { id: '8', title: 'Forma libre', type: 'Pintura',     year: 2022, art: 'art-p8', gridCol: '9/13',  gridRow: '9/15' },
    ],
  },
}

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const gallery  = GALLERIES[slug]

  return (
    <>
      <Nav />
      {gallery ? (
        <>
          <GalleryHero name={gallery.name} artist={gallery.artist} count={gallery.count} slug={slug} />
          <GalleryMasonry artworks={gallery.artworks} gallerySlug={slug} />
          <ArtistBar artist={gallery.artist} />
        </>
      ) : (
        <div className="flex items-center justify-center min-h-[50vh] text-ink3 text-[15px]">
          Galería no encontrada
        </div>
      )}
      <Footer />
      <ScrollReveal />
    </>
  )
}
