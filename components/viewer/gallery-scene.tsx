'use client'

import { useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls } from '@react-three/drei'
import { ArtworkWallSlot } from './artwork-wall-slot'
import type { GalleryManifest, SlotManifest } from '@/types/manifest'

// ── Scene parameters (exported so gallery-canvas and scene-controls can use them) ──

export interface SceneParams {
  ambientIntensity:  number
  keyLightIntensity: number
  accentIntensity:   number
  exposure:          number
  wallColor:         string
  floorMaterial:     'concrete' | 'parquet' | 'marble'
  rugVisible:        boolean
  rugStyle:          'classic' | 'minimal' | 'dark'
  fogNear:           number
  fogFar:            number
}

export const DEFAULT_SCENE_PARAMS: SceneParams = {
  ambientIntensity:  0.28,
  keyLightIntensity: 0.85,
  accentIntensity:   13,
  exposure:          0.95,
  wallColor:         '#f0ede8',
  floorMaterial:     'concrete',
  rugVisible:        true,
  rugStyle:          'classic',
  fogNear:           9,
  fogFar:            20,
}

// ── Template "white-cube-8" ─────────────────────────────────────────────────
// Room: 10 × 3.2 × 10 m. South wall has a 2.4 m entrance opening.
const TEMPLATE: Record<number, {
  pos: [number, number, number]
  rot: [number, number, number]
}> = {
  // North wall  (z = -5, faces +z)
  0: { pos: [-3,    1.65, -4.98], rot: [0, 0, 0] },
  1: { pos: [ 0,    1.65, -4.98], rot: [0, 0, 0] },
  2: { pos: [ 3,    1.65, -4.98], rot: [0, 0, 0] },
  // East wall   (x = +5, faces -x)
  3: { pos: [ 4.98, 1.65, -2.5], rot: [0, -Math.PI / 2, 0] },
  4: { pos: [ 4.98, 1.65,  1.5], rot: [0, -Math.PI / 2, 0] },
  // West wall   (x = -5, faces +x)
  5: { pos: [-4.98, 1.65, -2.5], rot: [0,  Math.PI / 2, 0] },
  6: { pos: [-4.98, 1.65,  1.5], rot: [0,  Math.PI / 2, 0] },
  // Floor pedestal slot
  7: { pos: [ 0,    0,    -1.0], rot: [0, 0, 0] },
}

// Warm accent lights aimed from ceiling toward each artwork position
const ARTWORK_LIGHTS: [number, number, number][] = [
  [-3,    3.05, -4.1],   // slot 0 north
  [ 0,    3.05, -4.1],   // slot 1 north
  [ 3,    3.05, -4.1],   // slot 2 north
  [ 4.15, 3.05, -2.5],   // slot 3 east
  [ 4.15, 3.05,  1.5],   // slot 4 east
  [-4.15, 3.05, -2.5],   // slot 5 west
  [-4.15, 3.05,  1.5],   // slot 6 west
]

const FLOOR_MATS: Record<string, { color: string; roughness: number; metalness: number }> = {
  concrete: { color: '#cac6bc', roughness: 0.42, metalness: 0.06 },
  parquet:  { color: '#9a7850', roughness: 0.58, metalness: 0.02 },
  marble:   { color: '#e2deda', roughness: 0.16, metalness: 0.07 },
}

const BASE_COLOR = '#eae6e0'
const TRIM_COLOR = '#e4e0da'

// ── Rug canvas-texture factory ─────────────────────────────────────────────

function buildRugTexture(style: SceneParams['rugStyle']): THREE.CanvasTexture {
  const W = 768, H = 512
  const cv = document.createElement('canvas')
  cv.width = W; cv.height = H
  const c = cv.getContext('2d')!

  if (style === 'classic') {
    // Persian-inspired: deep red + gold geometric borders and medallion
    c.fillStyle = '#3e0e0e'; c.fillRect(0, 0, W, H)
    c.fillStyle = '#6d1a1a'; c.fillRect(18, 18, W - 36, H - 36)

    // Triple gold border strokes
    c.strokeStyle = '#c8a850'; c.lineWidth = 2
    ;[22, 26, 30].forEach(d => c.strokeRect(d, d, W - d * 2, H - d * 2))

    // Dark inner band + lighter interior fill
    c.fillStyle = '#3e0e0e'; c.fillRect(38, 38, W - 76, H - 76)
    c.fillStyle = '#7a1f1f'; c.fillRect(46, 46, W - 92, H - 92)
    c.strokeStyle = '#c8a850'; c.lineWidth = 1.5
    c.strokeRect(50, 50, W - 100, H - 100)

    // Small diamond motifs along inner border
    c.strokeStyle = '#c8a85055'; c.lineWidth = 1
    const step = 32
    for (let x = 54 + step; x < W - 54; x += step) {
      [[x, 54], [x, H - 54]].forEach(([px, py]) => {
        const s = 7
        c.beginPath(); c.moveTo(px, py - s); c.lineTo(px + s, py); c.lineTo(px, py + s); c.lineTo(px - s, py); c.closePath(); c.stroke()
      })
    }
    for (let y = 54 + step; y < H - 54; y += step) {
      [[54, y], [W - 54, y]].forEach(([px, py]) => {
        const s = 7
        c.beginPath(); c.moveTo(px, py - s); c.lineTo(px + s, py); c.lineTo(px, py + s); c.lineTo(px - s, py); c.closePath(); c.stroke()
      })
    }

    // Center medallion — nested diamonds
    const cx = W / 2, cy = H / 2
    ;[72, 52, 32].forEach(r => {
      c.beginPath()
      c.moveTo(cx, cy - r); c.lineTo(cx + r, cy); c.lineTo(cx, cy + r); c.lineTo(cx - r, cy)
      c.closePath(); c.strokeStyle = '#c8a850'; c.lineWidth = r === 72 ? 2 : 1.5; c.stroke()
    })
    // Radial spokes
    c.strokeStyle = '#c8a85070'; c.lineWidth = 1
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4
      c.beginPath()
      c.moveTo(cx + Math.cos(a) * 15, cy + Math.sin(a) * 15)
      c.lineTo(cx + Math.cos(a) * 68, cy + Math.sin(a) * 68)
      c.stroke()
    }
    c.fillStyle = '#c8a850'; c.beginPath(); c.arc(cx, cy, 6, 0, Math.PI * 2); c.fill()

    // Corner ornaments
    ;[[68, 62], [W - 68, 62], [68, H - 62], [W - 68, H - 62]].forEach(([x, y]) => {
      const s = 18
      c.beginPath(); c.moveTo(x, y - s); c.lineTo(x + s, y); c.lineTo(x, y + s); c.lineTo(x - s, y); c.closePath()
      c.fillStyle = '#c8a85040'; c.fill()
      c.strokeStyle = '#c8a850'; c.lineWidth = 1.5; c.stroke()
    })

  } else if (style === 'minimal') {
    // Scandinavian: warm cream + subtle taupe geometry
    c.fillStyle = '#e0d2b8'; c.fillRect(0, 0, W, H)

    c.strokeStyle = '#9a8060'; c.lineWidth = 2.5; c.strokeRect(12, 12, W - 24, H - 24)
    c.lineWidth = 0.8; c.strokeRect(20, 20, W - 40, H - 40)

    // Subtle crosshatch grid
    c.strokeStyle = '#9a806028'; c.lineWidth = 1
    for (let x = 28; x < W; x += 52) { c.beginPath(); c.moveTo(x, 24); c.lineTo(x, H - 24); c.stroke() }
    for (let y = 28; y < H; y += 52) { c.beginPath(); c.moveTo(24, y); c.lineTo(W - 24, y); c.stroke() }

    // Center geometric motif
    const cx = W / 2, cy = H / 2
    c.strokeStyle = '#9a8060'; c.lineWidth = 1.5
    ;[[55, 35], [44, 26]].forEach(([hw, hh]) => c.strokeRect(cx - hw, cy - hh, hw * 2, hh * 2))
    c.beginPath(); c.moveTo(cx - 28, cy); c.lineTo(cx + 28, cy); c.moveTo(cx, cy - 20); c.lineTo(cx, cy + 20); c.stroke()
    c.fillStyle = '#9a8060'; c.beginPath(); c.arc(cx, cy, 4, 0, Math.PI * 2); c.fill()

  } else {
    // Dark / gallery-noir: charcoal + gold
    c.fillStyle = '#1a1610'; c.fillRect(0, 0, W, H)
    c.fillStyle = '#211d16'; c.fillRect(28, 28, W - 56, H - 56)

    // Gold border lines
    c.strokeStyle = '#c8a850'; c.lineWidth = 1.5
    ;[14, 22].forEach(d => c.strokeRect(d, d, W - d * 2, H - d * 2))
    c.strokeStyle = '#c8a85044'; c.lineWidth = 1; c.strokeRect(36, 36, W - 72, H - 72)

    // Diamond grid fill
    c.strokeStyle = '#c8a85030'; c.lineWidth = 1
    for (let gx = 56; gx < W - 28; gx += 52) {
      for (let gy = 52; gy < H - 28; gy += 52) {
        const s = 11
        c.beginPath(); c.moveTo(gx, gy - s); c.lineTo(gx + s, gy); c.lineTo(gx, gy + s); c.lineTo(gx - s, gy); c.closePath(); c.stroke()
      }
    }

    // Center emblem
    const cx = W / 2, cy = H / 2
    c.strokeStyle = '#c8a850'
    ;[[50, 2], [30, 1.5], [14, 1]].forEach(([r, w]) => {
      c.lineWidth = w
      c.beginPath(); c.moveTo(cx, cy - r); c.lineTo(cx + r, cy); c.lineTo(cx, cy + r); c.lineTo(cx - r, cy); c.closePath(); c.stroke()
    })
    // Radial lines
    c.strokeStyle = '#c8a85055'; c.lineWidth = 1
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4
      c.beginPath()
      c.moveTo(cx + Math.cos(a) * 18, cy + Math.sin(a) * 18)
      c.lineTo(cx + Math.cos(a) * 45, cy + Math.sin(a) * 45)
      c.stroke()
    }
    c.fillStyle = '#c8a850'; c.beginPath(); c.arc(cx, cy, 5, 0, Math.PI * 2); c.fill()
  }

  const tex = new THREE.CanvasTexture(cv)
  tex.anisotropy = 8
  return tex
}

// ── Component ──────────────────────────────────────────────────────────────

interface Props {
  manifest:    GalleryManifest
  selectedId:  string | null
  onSelect:    (slot: SlotManifest) => void
  sceneParams: SceneParams
}

export function GalleryScene({ manifest, selectedId, onSelect, sceneParams }: Props) {
  const wallCol  = sceneParams.wallColor
  const floorMat = FLOOR_MATS[sceneParams.floorMaterial ?? 'concrete']

  // Rug texture — rebuilt only when style changes
  const rugTexture = useMemo(
    () => buildRugTexture(sceneParams.rugStyle),
    [sceneParams.rugStyle],
  )
  useEffect(() => () => rugTexture.dispose(), [rugTexture])
  useEffect(() => () => { document.body.classList.remove('cursor-hover') }, [])

  return (
    <>
      {/* ── Lighting ── */}
      <ambientLight intensity={sceneParams.ambientIntensity} color="#fff8f2" />

      {/* Key directional — casts room shadows; positioned high above to avoid raking angles */}
      <directionalLight
        position={[0, 10, 3]}
        intensity={sceneParams.keyLightIntensity}
        color="#fff5e8"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={40}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-bias={-0.001}
      />

      {/* General ceiling fill — warm overhead wash */}
      <pointLight position={[-2.5, 2.9, -2.5]} intensity={3.5} color="#fff0d8" decay={2} />
      <pointLight position={[ 2.5, 2.9, -2.5]} intensity={3.5} color="#fff0d8" decay={2} />
      <pointLight position={[ 0,   2.9,  1.5]} intensity={2.5} color="#fff0d8" decay={2} />

      {/* Artwork accent lights — tight-radius warm spots, one per slot */}
      {ARTWORK_LIGHTS.map((pos) => (
        <pointLight
          key={pos.join(',')}
          position={pos}
          intensity={sceneParams.accentIntensity}
          color="#fff8e8"
          decay={2.5}
          distance={2.8}
        />
      ))}

      {/* Sculpture pedestal accent */}
      <pointLight position={[0.5, 2.7, -0.2]} intensity={sceneParams.accentIntensity * 1.23} color="#fff8e0" decay={2.5} distance={2.8} />

      {/* South-wall fill */}
      <pointLight position={[0, 1.8, 4.3]} intensity={5} color="#fff0d0" decay={2} distance={3.5} />

      {/* Entrance outside glow */}
      <pointLight position={[0, 2.2, 5.8]} intensity={8} color="#fff4d8" decay={2} distance={4.5} />

      {/* ── Floor ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial
          color={floorMat.color}
          roughness={floorMat.roughness}
          metalness={floorMat.metalness}
        />
      </mesh>

      {/* ── Rug — 5.4 × 3.6 m (3:2 matches canvas texture), centered slightly north ── */}
      {sceneParams.rugVisible && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, -0.5]} receiveShadow>
          <planeGeometry args={[5.4, 3.6]} />
          <meshStandardMaterial
            map={rugTexture}
            roughness={0.92}
            metalness={0.0}
          />
        </mesh>
      )}

      {/* ── Ceiling ── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.2, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#f6f4f0" roughness={1} />
      </mesh>

      {/* ── Walls ── */}
      {/* North wall */}
      <mesh position={[0, 1.6, -5]} receiveShadow>
        <planeGeometry args={[10, 3.2]} />
        <meshStandardMaterial color={wallCol} roughness={0.90} />
      </mesh>
      {/* East wall */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[5, 1.6, 0]} receiveShadow>
        <planeGeometry args={[10, 3.2]} />
        <meshStandardMaterial color={wallCol} roughness={0.90} />
      </mesh>
      {/* West wall */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-5, 1.6, 0]} receiveShadow>
        <planeGeometry args={[10, 3.2]} />
        <meshStandardMaterial color={wallCol} roughness={0.90} />
      </mesh>

      {/* ── South wall — entrance opening 2.4 m wide × 2.8 m tall ── */}
      <mesh rotation={[0, Math.PI, 0]} position={[-3.1, 1.6, 4.99]}>
        <planeGeometry args={[3.8, 3.2]} />
        <meshStandardMaterial color={wallCol} roughness={0.90} />
      </mesh>
      <mesh rotation={[0, Math.PI, 0]} position={[3.1, 1.6, 4.99]}>
        <planeGeometry args={[3.8, 3.2]} />
        <meshStandardMaterial color={wallCol} roughness={0.90} />
      </mesh>
      <mesh rotation={[0, Math.PI, 0]} position={[0, 3.0, 4.99]}>
        <planeGeometry args={[2.4, 0.4]} />
        <meshStandardMaterial color={wallCol} roughness={0.90} />
      </mesh>

      {/* ── Entrance door frame ── */}
      <mesh position={[-1.22, 1.40, 4.97]}>
        <boxGeometry args={[0.10, 2.84, 0.12]} />
        <meshStandardMaterial color="#1c1810" roughness={0.22} metalness={0.65} />
      </mesh>
      <mesh position={[1.22, 1.40, 4.97]}>
        <boxGeometry args={[0.10, 2.84, 0.12]} />
        <meshStandardMaterial color="#1c1810" roughness={0.22} metalness={0.65} />
      </mesh>
      <mesh position={[0, 2.86, 4.97]}>
        <boxGeometry args={[2.64, 0.10, 0.12]} />
        <meshStandardMaterial color="#1c1810" roughness={0.22} metalness={0.65} />
      </mesh>
      <mesh position={[0, 0.015, 4.92]}>
        <boxGeometry args={[2.40, 0.03, 0.20]} />
        <meshStandardMaterial color="#a8a49c" roughness={0.55} metalness={0.08} />
      </mesh>

      {/* ── Baseboards ── */}
      <mesh position={[0, 0.09, -4.98]}>
        <boxGeometry args={[10.04, 0.18, 0.05]} />
        <meshStandardMaterial color={BASE_COLOR} roughness={0.85} />
      </mesh>
      <mesh position={[4.98, 0.09, 0]}>
        <boxGeometry args={[0.05, 0.18, 10.04]} />
        <meshStandardMaterial color={BASE_COLOR} roughness={0.85} />
      </mesh>
      <mesh position={[-4.98, 0.09, 0]}>
        <boxGeometry args={[0.05, 0.18, 10.04]} />
        <meshStandardMaterial color={BASE_COLOR} roughness={0.85} />
      </mesh>
      <mesh position={[-3.1, 0.09, 4.98]}>
        <boxGeometry args={[3.8, 0.18, 0.05]} />
        <meshStandardMaterial color={BASE_COLOR} roughness={0.85} />
      </mesh>
      <mesh position={[3.1, 0.09, 4.98]}>
        <boxGeometry args={[3.8, 0.18, 0.05]} />
        <meshStandardMaterial color={BASE_COLOR} roughness={0.85} />
      </mesh>

      {/* ── Picture rails ── */}
      <mesh position={[0, 2.52, -4.96]}>
        <boxGeometry args={[10.04, 0.04, 0.07]} />
        <meshStandardMaterial color={TRIM_COLOR} roughness={0.82} />
      </mesh>
      <mesh position={[4.96, 2.52, 0]}>
        <boxGeometry args={[0.07, 0.04, 10.04]} />
        <meshStandardMaterial color={TRIM_COLOR} roughness={0.82} />
      </mesh>
      <mesh position={[-4.96, 2.52, 0]}>
        <boxGeometry args={[0.07, 0.04, 10.04]} />
        <meshStandardMaterial color={TRIM_COLOR} roughness={0.82} />
      </mesh>

      {/* ── Ceiling cornice ── */}
      <mesh position={[0, 3.18, -4.96]}>
        <boxGeometry args={[10.04, 0.08, 0.10]} />
        <meshStandardMaterial color={TRIM_COLOR} roughness={0.85} />
      </mesh>
      <mesh position={[4.96, 3.18, 0]}>
        <boxGeometry args={[0.10, 0.08, 10.04]} />
        <meshStandardMaterial color={TRIM_COLOR} roughness={0.85} />
      </mesh>
      <mesh position={[-4.96, 3.18, 0]}>
        <boxGeometry args={[0.10, 0.08, 10.04]} />
        <meshStandardMaterial color={TRIM_COLOR} roughness={0.85} />
      </mesh>

      {/* ── Ceiling track lights ── */}
      {([-1.9, 1.9] as const).map(x => (
        <group key={x}>
          <mesh position={[x, 3.17, -0.5]}>
            <boxGeometry args={[0.05, 0.03, 9]} />
            <meshStandardMaterial color="#201e18" roughness={0.35} metalness={0.75} />
          </mesh>
          {([-4.0, -2.4, -0.7, 0.9, 2.4] as const).map(z => (
            <group key={z} position={[x, 3.14, z]}>
              <mesh>
                <boxGeometry args={[0.09, 0.09, 0.09]} />
                <meshStandardMaterial color="#18160f" roughness={0.25} metalness={0.85} />
              </mesh>
              <mesh position={[0, -0.06, 0]}>
                <sphereGeometry args={[0.025, 8, 8]} />
                <meshStandardMaterial
                  color="#ffe8a0"
                  emissive="#ffe090"
                  emissiveIntensity={1.4}
                  roughness={0.1}
                />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* ── Artwork slots ── */}
      {manifest.slots.map(slot => {
        const tpl = TEMPLATE[slot.position]
        if (!tpl) return null

        if (slot.displayMode === 'FLOOR_MODEL') {
          return (
            <group key={slot.id} position={tpl.pos}>
              <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.60, 0.08, 0.60]} />
                <meshStandardMaterial color="#c4c0b8" roughness={0.72} metalness={0.07} />
              </mesh>
              <mesh position={[0, 0.60, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.44, 1.04, 0.44]} />
                <meshStandardMaterial color="#d0ccc4" roughness={0.76} metalness={0.05} />
              </mesh>
              <mesh position={[0, 1.14, 0]} receiveShadow>
                <boxGeometry args={[0.52, 0.04, 0.52]} />
                <meshStandardMaterial color="#c4c0b8" roughness={0.70} metalness={0.08} />
              </mesh>
              {slot.artwork && (
                <mesh
                  position={[0, 1.44, 0]}
                  castShadow
                  onPointerEnter={() => document.body.classList.add('cursor-hover')}
                  onPointerLeave={() => document.body.classList.remove('cursor-hover')}
                  onClick={e => { e.stopPropagation(); onSelect(slot) }}
                >
                  <octahedronGeometry args={[0.28, 0]} />
                  <meshStandardMaterial
                    color="#c8a850"
                    roughness={0.10}
                    metalness={0.88}
                    emissive="#8a6820"
                    emissiveIntensity={selectedId === slot.id ? 0.55 : 0.30}
                  />
                </mesh>
              )}
            </group>
          )
        }

        return (
          <ArtworkWallSlot
            key={slot.id}
            slot={slot}
            position={tpl.pos}
            rotation={tpl.rot}
            isSelected={slot.id === selectedId}
            onClick={() => onSelect(slot)}
          />
        )
      })}

      {/* ── Controls ── */}
      <OrbitControls
        target={[0, 1.5, 0]}
        minDistance={1.5}
        maxDistance={4.8}
        minPolarAngle={Math.PI * 0.18}
        maxPolarAngle={Math.PI * 0.72}
        enablePan={false}
        enableDamping
        dampingFactor={0.07}
      />
    </>
  )
}
