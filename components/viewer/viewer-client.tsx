'use client'

import dynamic from 'next/dynamic'
import type { GalleryManifest } from '@/types/manifest'

// Dynamic import kept in a client component so JSX transforms work correctly
const GalleryCanvas = dynamic(
  () => import('./gallery-canvas').then(m => ({ default: m.GalleryCanvas })),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full h-full flex flex-col items-center justify-center gap-4"
        style={{ background: '#f0ece6' }}
      >
        <div
          className="w-10 h-10 rounded-full border-2 animate-spin"
          style={{
            borderColor:    'oklch(60% 0.130 82 / .25)',
            borderTopColor: 'oklch(60% 0.130 82)',
          }}
        />
        <span
          className="text-[12px] tracking-[4px] uppercase"
          style={{ color: 'oklch(60% 0.130 82 / .55)' }}
        >
          Cargando galería
        </span>
      </div>
    ),
  },
)

interface Props {
  manifest: GalleryManifest
}

export function ViewerClient({ manifest }: Props) {
  return <GalleryCanvas manifest={manifest} />
}
