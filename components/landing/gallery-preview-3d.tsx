'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useTexture }        from '@react-three/drei'
import { useMemo, Suspense } from 'react'
import * as THREE            from 'three'

// ── Museum plaque via canvas texture ──────────────────────────────────────────

function makePlaqueTexture(): THREE.CanvasTexture {
  const cv = document.createElement('canvas')
  cv.width = 640; cv.height = 180
  const ctx = cv.getContext('2d')!
  ctx.fillStyle = '#f5f0e8'
  ctx.fillRect(0, 0, 640, 180)
  ctx.fillStyle = '#1a1812'
  ctx.font      = '500 42px Georgia, "Times New Roman", serif'
  ctx.textAlign = 'left'
  ctx.fillText('Sin título', 36, 72)
  ctx.fillStyle = '#7a6f60'
  ctx.font      = '400 30px Georgia, "Times New Roman", serif'
  ctx.fillText('Óleo sobre lienzo · 2024', 36, 128)
  return new THREE.CanvasTexture(cv)
}

// ── Slow camera pan to reveal both side walls ─────────────────────────────────

function CameraRig() {
  useFrame(({ clock, camera }) => {
    const t   = clock.getElapsedTime()
    const pan = Math.sin(t * 0.16) * 0.44
    camera.position.set(0, 1.75 + Math.sin(t * 0.09) * 0.03, 5.8)
    camera.lookAt(Math.sin(pan) * 3.6, 1.62, -2.0)
  })
  return null
}

// ── Room ──────────────────────────────────────────────────────────────────────

function Room() {
  const floorMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#cec6b6', roughness: 0.06, metalness: 0, reflectivity: 0.42,
  }), [])
  const wallMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#f8f5f0', roughness: 0.96,
  }), [])
  const ceilMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#faf8f5', roughness: 0.97,
  }), [])
  const baseMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1e1c18', roughness: 0.85,
  }), [])

  return (
    <group>
      <mesh position={[0, 0, -1.5]} rotation={[-Math.PI / 2, 0, 0]} material={floorMat}>
        <planeGeometry args={[10, 13]} />
      </mesh>
      <mesh position={[0, 4.2, -1.5]} rotation={[Math.PI / 2, 0, 0]} material={ceilMat}>
        <planeGeometry args={[10, 13]} />
      </mesh>
      <mesh position={[0, 2.1, -5.2]} material={wallMat}>
        <planeGeometry args={[10, 4.2]} />
      </mesh>
      <mesh position={[-5, 2.1, -1.5]} rotation={[0, Math.PI / 2, 0]} material={wallMat}>
        <planeGeometry args={[13, 4.2]} />
      </mesh>
      <mesh position={[5, 2.1, -1.5]} rotation={[0, -Math.PI / 2, 0]} material={wallMat}>
        <planeGeometry args={[13, 4.2]} />
      </mesh>
      {/* Baseboards */}
      <mesh position={[0, 0.09, -5.18]} material={baseMat}>
        <boxGeometry args={[10, 0.18, 0.04]} />
      </mesh>
      {/* Centrar el box EN la pared (no delante): la cara interior queda a 2 cm en sala,
          la cara exterior se embebe en el muro → ninguna cara frontal coincide con la pared */}
      <mesh position={[-5.00, 0.09, -1.5]} rotation={[0, Math.PI / 2, 0]} material={baseMat}>
        <boxGeometry args={[13, 0.18, 0.04]} />
      </mesh>
      <mesh position={[5.00, 0.09, -1.5]} rotation={[0, -Math.PI / 2, 0]} material={baseMat}>
        <boxGeometry args={[13, 0.18, 0.04]} />
      </mesh>
    </group>
  )
}

// ── Framed artwork ────────────────────────────────────────────────────────────

const FRAME_MAT = new THREE.MeshStandardMaterial({ color: '#18180f', roughness: 0.45, metalness: 0.08 })

interface ArtworkProps {
  position: [number, number, number]
  rotation?: [number, number, number]
  w: number
  h: number
  texture: THREE.Texture
}

function Artwork({ position, rotation, w, h, texture }: ArtworkProps) {
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: texture, roughness: 0.88 }),
    [texture],
  )
  const b = 0.09
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, -0.018]} material={FRAME_MAT}>
        <boxGeometry args={[w + b * 2, h + b * 2, 0.05]} />
      </mesh>
      <mesh position={[0, 0, 0.01]} material={mat}>
        <planeGeometry args={[w, h]} />
      </mesh>
    </group>
  )
}

// ── Full scene (needs Suspense for useTexture) ────────────────────────────────

function Scene() {
  const [tex31, tex32, tex14, tex15, tex1] = useTexture([
    '/images/preview/obra-31.jpg',
    '/images/preview/obra-32.jpg',
    '/images/preview/obra-14.jpg',
    '/images/preview/obra-15.webp',
    '/images/preview/obra-1.jpg',
  ])

  const plaqueTex = useMemo(() => makePlaqueTexture(), [])
  const plaqueMat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: plaqueTex, roughness: 0.9 }),
    [plaqueTex],
  )

  return (
    <>
      <CameraRig />

      {/* Ambient + soft fill */}
      <ambientLight intensity={0.65} color="#fff9f0" />
      <directionalLight position={[0, 8, 5]} intensity={0.4} color="#fffcf5" />
      <pointLight position={[0, 2.0, 5.5]} intensity={2.5} color="#f0ecff" distance={12} decay={2} />

      {/* Back wall: one spot per artwork */}
      <pointLight position={[-2.8, 3.7, -4.8]} intensity={5}   color="#fff4d6" distance={3}   decay={2} />
      <pointLight position={[0,    3.7, -4.8]} intensity={7}   color="#fff4d6" distance={4.5} decay={2} />
      <pointLight position={[2.9,  3.7, -4.8]} intensity={5}   color="#fff4d6" distance={3}   decay={2} />

      {/* Side wall spots */}
      <pointLight position={[-4.8, 3.6, -1.5]} intensity={4.5} color="#fff4d6" distance={3.5} decay={2} />
      <pointLight position={[4.8,  3.6, -1.5]} intensity={4.5} color="#fff4d6" distance={3.5} decay={2} />

      <Room />

      {/* Back wall — 3 artworks */}
      {/* Left: obra_32 — samurai paper-cut, portrait */}
      <Artwork position={[-2.8, 2.1, -5.15]}  w={1.4} h={1.9} texture={tex32} />
      {/* Center: obra_31 — kayaker waves, portrait (main piece) */}
      <Artwork position={[0,    2.35, -5.15]} w={2.4} h={3.0} texture={tex31} />
      {/* Right: obra_14 — cyberpunk city, landscape */}
      <Artwork position={[2.9,  1.9, -5.15]}  w={2.5} h={1.4} texture={tex14} />

      {/* Museum plaque — y=0.58 keeps it below canvas bottom (y=0.85), z=-5.12 avoids
          coplanar overlap with canvas which sits at z=-5.14 */}
      <mesh position={[0, 0.58, -5.12]} material={plaqueMat}>
        <planeGeometry args={[1.05, 0.28]} />
      </mesh>

      {/* Side walls */}
      {/* Left: obra_15 — figure floating over river, landscape */}
      <Artwork
        position={[-4.96, 2.15, -1.5]}
        rotation={[0, Math.PI / 2, 0]}
        w={3.0} h={2.0}
        texture={tex15}
      />
      {/* Right: obra_1 — fantasy moon+sun landscape */}
      <Artwork
        position={[4.96, 2.15, -1.5]}
        rotation={[0, -Math.PI / 2, 0]}
        w={3.0} h={1.7}
        texture={tex1}
      />
    </>
  )
}

// ── Exported component ────────────────────────────────────────────────────────

export function GalleryPreview3D() {
  return (
    <Canvas
      camera={{ position: [0, 1.75, 5.8], fov: 65, near: 0.05, far: 60 }}
      dpr={[1, 1.5]}
      gl={{
        antialias:           true,
        alpha:               false,
        toneMapping:         THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
      style={{ background: '#f8f5f0', display: 'block', width: '100%', height: '100%' }}
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  )
}
