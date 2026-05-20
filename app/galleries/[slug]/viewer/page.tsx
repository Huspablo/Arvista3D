import Link            from 'next/link'
import { ViewerClient } from '@/components/viewer/viewer-client'
import type { GalleryManifest } from '@/types/manifest'

// ── Mock manifests — replace with GET /api/galleries/[slug]/manifest ────────
const MOCK_MANIFESTS: Record<string, GalleryManifest> = {
  'texturas-urbanas': {
    gallery: {
      id:          'gal_01',
      name:        'Texturas urbanas',
      templateKey: 'white-cube-8',
      config: { wallColor: '#f0ede8', floorMaterial: 'concrete', lightingPreset: 'warm' },
    },
    slots: [
      {
        id: 'slot_0', position: 0, displayMode: 'WALL_PLANE',
        artwork: { id: '1', title: 'Espiral #3',   artistName: 'Mariana López', type: 'SCULPTURE',
          year: 2024, tags: ['bronce', 'abstracto'], dimensions: { width: 40, height: 60 },
          assets: { thumbnail: '', gallery: '', detail: '' } },
      },
      {
        id: 'slot_1', position: 1, displayMode: 'WALL_PLANE',
        artwork: { id: '2', title: 'Bruma I',       artistName: 'Mariana López', type: 'PHOTOGRAPHY',
          year: 2023, tags: ['urbano', 'niebla'], dimensions: { width: 90, height: 60 },
          assets: { thumbnail: '', gallery: '', detail: '' } },
      },
      {
        id: 'slot_2', position: 2, displayMode: 'WALL_PLANE',
        artwork: { id: '3', title: 'Agua & Luz',   artistName: 'Mariana López', type: 'OTHER',
          year: 2023, tags: ['instalación', 'luz'], dimensions: { width: 120, height: 80 },
          assets: { thumbnail: '', gallery: '', detail: '' } },
      },
      {
        id: 'slot_3', position: 3, displayMode: 'WALL_PLANE',
        artwork: { id: '5', title: 'Vacío útil',   artistName: 'Mariana López', type: 'OTHER',
          year: 2023, tags: ['vídeo', 'sonido'], dimensions: { width: 80, height: 60 },
          assets: { thumbnail: '', gallery: '', detail: '' } },
      },
      {
        id: 'slot_4', position: 4, displayMode: 'WALL_PLANE',
        artwork: { id: '7', title: 'Luz baja',     artistName: 'Mariana López', type: 'PHOTOGRAPHY',
          year: 2023, tags: ['fotografía', 'luz'], dimensions: { width: 60, height: 90 },
          assets: { thumbnail: '', gallery: '', detail: '' } },
      },
      {
        id: 'slot_5', position: 5, displayMode: 'WALL_PLANE',
        artwork: { id: '8', title: 'Forma libre',  artistName: 'Mariana López', type: 'PAINTING',
          year: 2022, tags: ['pintura', 'óleo'], dimensions: { width: 140, height: 110 },
          assets: { thumbnail: '', gallery: '', detail: '' } },
      },
      {
        id: 'slot_6', position: 6, displayMode: 'WALL_PLANE',
        artwork: { id: '4', title: 'Raíz doble',   artistName: 'Mariana López', type: 'PAINTING',
          year: 2024, tags: ['pintura', 'dualidad'], dimensions: { width: 120, height: 100 },
          assets: { thumbnail: '', gallery: '', detail: '' } },
      },
      {
        id: 'slot_7', position: 7, displayMode: 'FLOOR_MODEL',
        artwork: { id: '6', title: 'Textura #7',   artistName: 'Mariana López', type: 'SCULPTURE',
          year: 2024, tags: ['bronce', 'textura'], dimensions: { width: 35, height: 90, depth: 35 },
          assets: { model: '', thumbnail: '' } },
      },
    ],
  },
}

export default async function ViewerPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug }  = await params
  const manifest  = MOCK_MANIFESTS[slug]

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: '#f0ece6' }}>

      {/* HUD */}
      <div
        className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-4 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, oklch(8% 0 0 / .65), transparent)' }}
      >
        <div className="pointer-events-auto flex items-center gap-4">
          <Link
            href={`/galleries/${slug}`}
            className="text-[13px] no-underline transition-opacity hover:opacity-100"
            style={{ color: 'oklch(78% 0.008 75 / .7)' }}
          >
            ← Volver
          </Link>
          <span className="w-px h-4" style={{ background: 'oklch(78% 0.008 75 / .2)' }} />
          <span className="font-serif text-[15px] font-bold" style={{ color: 'oklch(90% 0.008 75)' }}>
            {manifest?.gallery.name ?? slug}
          </span>
        </div>
        <span
          className="text-[11px] tracking-[3px] uppercase max-md:hidden"
          style={{ color: 'oklch(55% 0.008 75 / .55)' }}
        >
          Arrastra · Rueda para zoom · Clic en una obra
        </span>
      </div>

      {/* Canvas */}
      <div className="flex-1">
        {manifest ? (
          <ViewerClient manifest={manifest} />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-[14px]"
            style={{ color: 'oklch(55% 0.008 75 / .5)' }}
          >
            Galería no encontrada
          </div>
        )}
      </div>
    </div>
  )
}
