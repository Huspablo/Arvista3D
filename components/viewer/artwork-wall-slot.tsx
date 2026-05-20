'use client'

import { useRef, useState, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { SlotManifest } from '@/types/manifest'

// Rich palette per slot — base, mid, accent
const PALETTES: [string, string, string][] = [
  ['#7a5c9a', '#d4a840', '#4a5888'],   // violet / gold / navy
  ['#3a7858', '#c8c848', '#286848'],   // forest / lime / deep green
  ['#c07040', '#d8b060', '#984820'],   // terracotta / amber / rust
  ['#385878', '#7898b8', '#204868'],   // slate / sky / dark navy
  ['#906830', '#c8a048', '#785028'],   // ochre / gold / umber
  ['#3a7870', '#68b0a0', '#285860'],   // teal / aqua / dark teal
  ['#784888', '#b068a8', '#502860'],   // plum / rose / deep violet
  ['#a04038', '#d07850', '#782820'],   // crimson / coral / dark red
]

function makeMockTexture(idx: number): THREE.CanvasTexture {
  const S  = 512
  const cv = Object.assign(document.createElement('canvas'), { width: S, height: S })
  const cx = cv.getContext('2d')!
  const [c0, c1, c2] = PALETTES[idx % PALETTES.length]

  // ── Background gradient ─────────────────────────────────────────────────
  const bg = cx.createRadialGradient(S * 0.25, S * 0.75, S * 0.02, S * 0.68, S * 0.28, S * 0.72)
  bg.addColorStop(0,    c0)
  bg.addColorStop(0.50, c1)
  bg.addColorStop(1,    c2)
  cx.fillStyle = bg
  cx.fillRect(0, 0, S, S)

  // ── Secondary diagonal wash ─────────────────────────────────────────────
  cx.globalAlpha = 0.28
  const wash = cx.createLinearGradient(0, 0, S * 0.9, S)
  wash.addColorStop(0, '#ffffff')
  wash.addColorStop(0.5, 'transparent')
  wash.addColorStop(1, c2)
  cx.fillStyle = wash
  cx.fillRect(0, 0, S, S)
  cx.globalAlpha = 1

  // ── Central light form (luminous core) ──────────────────────────────────
  cx.globalAlpha = 0.22
  const core = cx.createRadialGradient(S * 0.50, S * 0.44, S * 0.06, S * 0.50, S * 0.44, S * 0.36)
  core.addColorStop(0, '#ffffff')
  core.addColorStop(0.6, 'transparent')
  cx.fillStyle = core
  cx.fillRect(0, 0, S, S)
  cx.globalAlpha = 1

  // ── Abstract horizontal bands (brushstroke feel) ────────────────────────
  cx.globalAlpha = 0.07
  for (let i = 0; i < 7; i++) {
    const y = (S / 7) * i + Math.random() * 20
    const h = Math.random() * 24 + 6
    cx.fillStyle = i % 2 === 0 ? '#ffffff' : '#000000'
    cx.fillRect(0, y, S, h)
  }
  cx.globalAlpha = 1

  // ── Random soft shapes (gestural marks) ────────────────────────────────
  cx.globalAlpha = 0.12
  for (let i = 0; i < 4; i++) {
    const gx = Math.random() * S
    const gy = Math.random() * S
    const r  = Math.random() * S * 0.25 + S * 0.08
    const sp = cx.createRadialGradient(gx, gy, 0, gx, gy, r)
    sp.addColorStop(0, i % 2 === 0 ? '#ffffff' : c1)
    sp.addColorStop(1, 'transparent')
    cx.fillStyle = sp
    cx.beginPath()
    cx.arc(gx, gy, r, 0, Math.PI * 2)
    cx.fill()
  }
  cx.globalAlpha = 1

  // ── Fine grain texture ──────────────────────────────────────────────────
  cx.globalAlpha = 0.028
  for (let i = 0; i < 7000; i++) {
    cx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000'
    cx.fillRect(Math.random() * S, Math.random() * S, 1.5, 1.5)
  }
  cx.globalAlpha = 1

  const tex = new THREE.CanvasTexture(cv)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

const GOLD_COL  = new THREE.Color(0.82, 0.68, 0.30)
const FRAME_COL = new THREE.Color(0.14, 0.12, 0.08)
const EMPTY_COL = new THREE.Color(0.88, 0.86, 0.84)
const MAT_COL   = new THREE.Color(0.94, 0.92, 0.88)  // mat board (slightly off-white)

interface Props {
  slot:       SlotManifest
  position:   [number, number, number]
  rotation:   [number, number, number]
  isSelected: boolean
  onClick:    () => void
}

export function ArtworkWallSlot({ slot, position, rotation, isSelected, onClick }: Props) {
  const [hovered, setHovered] = useState(false)
  const frameRef  = useRef<THREE.Mesh>(null!)

  const texture = useMemo(
    () => (slot.artwork ? makeMockTexture(slot.position) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slot.position, !!slot.artwork],
  )

  useEffect(() => () => { texture?.dispose() }, [texture])

  // Artwork size derived from dimensions (cm → m), clamped to slot
  const dim  = slot.artwork?.dimensions
  const rawW = dim ? dim.width  / 100 : 0.88
  const rawH = dim ? dim.height / 100 : 0.70
  const sc   = Math.min(1.22 / rawW, 0.98 / rawH, 1)
  const artW = rawW * sc
  const artH = rawH * sc

  // Mat board adds 3 cm each side; outer frame adds 3 cm on top of mat
  const matW  = artW + 0.06
  const matH  = artH + 0.06
  const fW    = matW + 0.07
  const fH    = matH + 0.07

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

  const onEnter = () => { setHovered(true);  document.body.classList.add('cursor-hover') }
  const onLeave = () => { setHovered(false); document.body.classList.remove('cursor-hover') }

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

      {/* Mat board — subtle off-white border visible between frame and canvas */}
      <mesh position={[0, 0, 0.028]}>
        <planeGeometry args={[matW, matH]} />
        <meshStandardMaterial color={MAT_COL} roughness={0.95} metalness={0} />
      </mesh>

      {/* Canvas surface */}
      {texture ? (
        <mesh position={[0, 0, 0.032]}>
          <planeGeometry args={[artW, artH]} />
          <meshStandardMaterial map={texture} roughness={0.88} metalness={0} />
        </mesh>
      ) : (
        <mesh position={[0, 0, 0.032]}>
          <planeGeometry args={[artW, artH]} />
          <meshStandardMaterial color={EMPTY_COL} roughness={1} />
        </mesh>
      )}
    </group>
  )
}
