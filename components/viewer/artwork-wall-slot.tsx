'use client'

import { Component, Suspense, useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import type { SlotManifest, FlatAssets } from '@/types/manifest'

const GOLD_COL  = new THREE.Color(0.82, 0.68, 0.30)
const FRAME_COL = new THREE.Color(0.14, 0.12, 0.08)
const EMPTY_COL = new THREE.Color(0.88, 0.86, 0.84)
const MAT_COL   = new THREE.Color(0.94, 0.92, 0.88)

// ── Plain canvas — fallback / empty / pending state ────────────────────────
function PlainPlane({ artW, artH, color }: { artW: number; artH: number; color: THREE.Color }) {
  return (
    <mesh position={[0, 0, 0.032]}>
      <planeGeometry args={[artW, artH]} />
      <meshStandardMaterial color={color} roughness={1} metalness={0} />
    </mesh>
  )
}

// ── Loads real CDN texture. Must be inside <Suspense> + <TextureErrorBoundary> ──
function ArtworkTexturePlane({ url, artW, artH }: { url: string; artW: number; artH: number }) {
  const texture = useTexture(url, (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace
    tex.needsUpdate = true
  })
  return (
    <mesh position={[0, 0, 0.032]}>
      <planeGeometry args={[artW, artH]} />
      <meshStandardMaterial map={texture} roughness={0.88} metalness={0} />
    </mesh>
  )
}

// ── Catches useTexture failures (CORS, 404, network) ──────────────────────
class TextureErrorBoundary extends Component<
  { artW: number; artH: number; children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (this.state.failed) {
      return <PlainPlane artW={this.props.artW} artH={this.props.artH} color={EMPTY_COL} />
    }
    return this.props.children
  }
}

interface Props {
  slot:       SlotManifest
  position:   [number, number, number]
  rotation:   [number, number, number]
  isSelected: boolean
  onClick:    () => void
}

export function ArtworkWallSlot({ slot, position, rotation, isSelected, onClick }: Props) {
  const [hovered, setHovered] = useState(false)
  const frameRef = useRef<THREE.Mesh>(null!)

  // Artwork size derived from dimensions (cm → m), clamped to slot
  const dim  = slot.artwork?.dimensions
  const rawW = dim ? dim.width  / 100 : 0.88
  const rawH = dim ? dim.height / 100 : 0.70
  const sc   = Math.min(1.22 / rawW, 0.98 / rawH, 1)
  const artW = rawW * sc
  const artH = rawH * sc

  // Mat board adds 3 cm each side; outer frame adds 3 cm on top of mat
  const matW = artW + 0.06
  const matH = artH + 0.06
  const fW   = matW + 0.07
  const fH   = matH + 0.07

  // Lerp frame color toward gold on hover / selected
  useFrame(() => {
    if (!frameRef.current) return
    const mat    = frameRef.current.material as THREE.MeshStandardMaterial
    const target = isSelected || hovered ? GOLD_COL : FRAME_COL
    mat.color.lerp(target, 0.10)
    mat.emissiveIntensity = THREE.MathUtils.lerp(
      mat.emissiveIntensity,
      isSelected ? 0.30 : hovered ? 0.18 : 0,
      0.10,
    )
  })

  useEffect(() => () => { document.body.classList.remove('cursor-hover') }, [])

  const onEnter = () => { setHovered(true);  document.body.classList.add('cursor-hover') }
  const onLeave = () => { setHovered(false); document.body.classList.remove('cursor-hover') }

  // Prefer gallery (1200px); fall back to thumbnail for artworks whose pipeline
  // hasn't produced the gallery variant yet. R2 public buckets (*.r2.dev) serve
  // Access-Control-Allow-Origin: * by default, so direct CDN URLs work in WebGL.
  const rawUrl     = slot.artwork && 'gallery' in slot.artwork.assets
    ? ((slot.artwork.assets as FlatAssets).gallery || (slot.artwork.assets as FlatAssets).thumbnail)
    : null
  const galleryUrl = rawUrl || null   // coerce '' → null

  return (
    <group position={position} rotation={rotation}>
      {/* Outer frame */}
      <mesh
        ref={frameRef}
        onPointerEnter={onEnter}
        onPointerLeave={onLeave}
        onClick={e => { e.stopPropagation(); onClick() }}
        castShadow
      >
        <boxGeometry args={[fW, fH, 0.045]} />
        <meshStandardMaterial
          color={FRAME_COL}
          roughness={0.20}
          metalness={0.60}
          emissive={GOLD_COL}
          emissiveIntensity={0}
        />
      </mesh>

      {/* Mat board — off-white border between frame and canvas */}
      <mesh position={[0, 0, 0.028]}>
        <planeGeometry args={[matW, matH]} />
        <meshStandardMaterial color={MAT_COL} roughness={0.95} metalness={0} />
      </mesh>

      {/* Canvas surface — real CDN texture or graceful fallback */}
      {galleryUrl ? (
        <TextureErrorBoundary artW={artW} artH={artH}>
          <Suspense fallback={<PlainPlane artW={artW} artH={artH} color={EMPTY_COL} />}>
            <ArtworkTexturePlane url={galleryUrl} artW={artW} artH={artH} />
          </Suspense>
        </TextureErrorBoundary>
      ) : (
        <PlainPlane artW={artW} artH={artH} color={EMPTY_COL} />
      )}
    </group>
  )
}
