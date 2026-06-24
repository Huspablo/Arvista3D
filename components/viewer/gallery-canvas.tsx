'use client'

import { Suspense, useState, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// R3F 9.x uses THREE.Clock internally; Three.js r175+ deprecated it in favour
// of THREE.Timer. Suppress until @react-three/fiber ships the fix upstream.
if (typeof window !== 'undefined') {
  const _warn = console.warn.bind(console)
  console.warn = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].startsWith('THREE.Clock')) return
    _warn(...args)
  }
}
import { GalleryScene, DEFAULT_SCENE_PARAMS } from './gallery-scene'
import { ArtworkOverlay }                     from './artwork-overlay'
import { SceneControls }                      from './scene-controls'
import { useUpdateGallery }                   from '@/lib/hooks/use-galleries'
import type { GalleryManifest, SlotManifest } from '@/types/manifest'
import type { SceneParams }                   from './gallery-scene'
import type { FloorMaterial }                 from '@prisma/client'

const SCENE_BG = '#f0ece6'

function ExposureSync({ value }: { value: number }) {
  const { gl } = useThree()
  useEffect(() => { gl.toneMappingExposure = value }, [gl, value])
  return null
}

interface Props {
  manifest:  GalleryManifest
  galleryId: string
  isOwner:   boolean
}

export function GalleryCanvas({ manifest, galleryId, isOwner }: Props) {
  const [selected,   setSelected]  = useState<SlotManifest | null>(null)
  const [saveError,  setSaveError] = useState('')
  const updateGallery = useUpdateGallery()

  // Track the last-persisted config so isDirty reflects actual unsaved changes
  const [savedConfig, setSavedConfig] = useState({
    wallColor:     manifest.gallery.config.wallColor     ?? DEFAULT_SCENE_PARAMS.wallColor,
    floorMaterial: manifest.gallery.config.floorMaterial ?? DEFAULT_SCENE_PARAMS.floorMaterial,
  })

  const [sceneParams, setSceneParams] = useState<SceneParams>(() => ({
    ...DEFAULT_SCENE_PARAMS,
    wallColor:     savedConfig.wallColor,
    floorMaterial: savedConfig.floorMaterial,
  }))

  const updateParams = (patch: Partial<SceneParams>) =>
    setSceneParams(prev => ({ ...prev, ...patch }))

  const resetParams = () =>
    setSceneParams({
      ...DEFAULT_SCENE_PARAMS,
      wallColor:     savedConfig.wallColor,
      floorMaterial: savedConfig.floorMaterial,
    })

  const isDirty =
    sceneParams.wallColor     !== savedConfig.wallColor ||
    sceneParams.floorMaterial !== savedConfig.floorMaterial

  const handleSave = () => {
    setSaveError('')
    updateGallery.mutate(
      {
        id:            galleryId,
        wallColor:     sceneParams.wallColor,
        floorMaterial: sceneParams.floorMaterial.toUpperCase() as FloorMaterial,
      },
      {
        onSuccess: () => {
          setSavedConfig({
            wallColor:     sceneParams.wallColor,
            floorMaterial: sceneParams.floorMaterial,
          })
        },
        onError: (err) => {
          setSaveError(err instanceof Error ? err.message : 'Error al guardar')
        },
      },
    )
  }

  const hasPanel = Boolean(selected?.artwork)

  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: [0, 1.7, 4.5], fov: 58 }}
        shadows="percentage"
        gl={{
          antialias:           true,
          toneMapping:         THREE.ACESFilmicToneMapping,
          toneMappingExposure: DEFAULT_SCENE_PARAMS.exposure,
        }}
        onPointerMissed={() => setSelected(null)}
      >
        <color attach="background" args={[SCENE_BG]} />
        <fog attach="fog" args={[SCENE_BG, sceneParams.fogNear, sceneParams.fogFar]} />

        <ExposureSync value={sceneParams.exposure} />

        <Suspense fallback={null}>
          <GalleryScene
            manifest={manifest}
            selectedId={selected?.id ?? null}
            onSelect={setSelected}
            sceneParams={sceneParams}
          />
        </Suspense>
      </Canvas>

      {/* Subtle right-side scrim that guides attention to the detail panel */}
      {hasPanel && (
        <div
          className="absolute inset-0 z-10 pointer-events-none max-md:hidden"
          style={{ background: 'linear-gradient(to right, transparent 55%, oklch(5% 0 0 / .12) 100%)' }}
        />
      )}

      {hasPanel && (
        <ArtworkOverlay slot={selected!} onClose={() => setSelected(null)} />
      )}

      <SceneControls
        params={sceneParams}
        onChange={updateParams}
        onReset={resetParams}
        isOwner={isOwner}
        isDirty={isDirty}
        isSaving={updateGallery.isPending}
        saveError={saveError}
        onSave={handleSave}
      />
    </div>
  )
}
