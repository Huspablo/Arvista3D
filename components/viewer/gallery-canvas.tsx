'use client'

import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { GalleryScene }    from './gallery-scene'
import { ArtworkOverlay }  from './artwork-overlay'
import type { GalleryManifest, SlotManifest } from '@/types/manifest'

interface Props {
  manifest: GalleryManifest
}

// Warm gallery white — matches wall/fog color so there's no hard edge at room boundaries
const SCENE_BG = '#f0ece6'

export function GalleryCanvas({ manifest }: Props) {
  const [selected, setSelected] = useState<SlotManifest | null>(null)

  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: [0, 1.7, 4.5], fov: 58 }}
        shadows="percentage"
        gl={{
          antialias:           true,
          toneMapping:         THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.95,
        }}
        onPointerMissed={() => setSelected(null)}
      >
        {/* Scene background + fog — hides the void at room boundaries */}
        <color attach="background" args={[SCENE_BG]} />
        <fog attach="fog" args={[SCENE_BG, 9, 20]} />

        <Suspense fallback={null}>
          <GalleryScene
            manifest={manifest}
            selectedId={selected?.id ?? null}
            onSelect={setSelected}
          />
        </Suspense>
      </Canvas>

      {selected?.artwork && (
        <ArtworkOverlay slot={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
