import { Nav }               from '@/components/layout/nav'
import { Footer }             from '@/components/layout/footer'
import { ArtworkImageZone }   from '@/components/artwork/artwork-image-zone'
import { ArtworkInfoPanel }   from '@/components/artwork/artwork-info-panel'
import { ScrollReveal }       from '@/components/ui/scroll-reveal'
import Link                   from 'next/link'

interface ArtworkData {
  title:       string
  artist:      string
  type:        string
  year:        number
  dims:        string
  technique:   string
  edition:     string
  gallery:     string | null
  gallerySlug: string | null
  description: string
  arts:        string[]
}

const ARTWORKS: Record<string, ArtworkData> = {
  '1': {
    title:       'Espiral #3',
    artist:      'Mariana López',
    type:        'Escultura',
    year:        2024,
    dims:        '40 × 60 × 30 cm',
    technique:   'Bronce fundido',
    edition:     '1 / 3',
    gallery:     'Texturas urbanas',
    gallerySlug: 'texturas-urbanas',
    description: 'Una exploración de la forma helicoidal como metáfora del tiempo cíclico. La superficie pulida captura la luz ambiental y la remodela, creando diálogos dinámicos entre la obra y su entorno inmediato.',
    arts:        ['art-p1', 'art-p3', 'art-p5', 'art-p7'],
  },
  '2': {
    title:       'Bruma I',
    artist:      'Mariana López',
    type:        'Fotografía',
    year:        2023,
    dims:        '90 × 60 cm',
    technique:   'Impresión pigment ink',
    edition:     '3 / 5',
    gallery:     'Texturas urbanas',
    gallerySlug: 'texturas-urbanas',
    description: 'Serie sobre estados de transición en el paisaje urbano. La niebla como protagonista que difumina fronteras y revela texturas ocultas en la arquitectura cotidiana.',
    arts:        ['art-p2', 'art-p4', 'art-p6', 'art-p8'],
  },
  '4': {
    title:       'Raíz doble',
    artist:      'Mariana López',
    type:        'Pintura',
    year:        2024,
    dims:        '120 × 100 cm',
    technique:   'Óleo sobre lino',
    edition:     'Obra única',
    gallery:     'Agua & Forma',
    gallerySlug: null,
    description: 'Dualidad y simbiosis. Dos sistemas radiculares que comparten sustrato y se entrelazan sin perder su identidad individual. Una meditación sobre interdependencia y autonomía.',
    arts:        ['art-p4', 'art-p9', 'art-p11', 'art-p2'],
  },
}

export default async function ArtworkPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id }   = await params
  const artwork  = ARTWORKS[id]

  return (
    <>
      <Nav />

      {/* Breadcrumb */}
      <nav className="px-15 py-5 flex items-center gap-2.5 text-[13px] text-ink3 border-b border-(--border) max-md:px-6">
        <Link href="/obras" className="text-ink3 no-underline hover:text-ink transition-colors">
          Obras
        </Link>
        <span className="text-(--border-md)">/</span>
        {artwork?.gallery && artwork.gallerySlug && (
          <>
            <Link
              href={`/galleries/${artwork.gallerySlug}`}
              className="text-ink3 no-underline hover:text-ink transition-colors"
            >
              {artwork.gallery}
            </Link>
            <span className="text-(--border-md)">/</span>
          </>
        )}
        <span className="text-ink">{artwork?.title ?? 'Obra'}</span>
      </nav>

      {artwork ? (
        <div
          className="max-md:block border-t border-(--border)"
          style={{ display: 'grid', gridTemplateColumns: '1fr 400px', minHeight: 'calc(100vh - 120px)' }}
        >
          <ArtworkImageZone arts={artwork.arts} title={artwork.title} />
          <ArtworkInfoPanel artwork={artwork} />
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-[50vh] text-ink3 text-[15px]">
          Obra no encontrada
        </div>
      )}

      <Footer />
      <ScrollReveal />
    </>
  )
}
