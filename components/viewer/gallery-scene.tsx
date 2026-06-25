'use client'

import { useMemo, useEffect } from 'react'
import { OrbitControls } from '@react-three/drei'
import { buildRugTexture } from '@/lib/utils/textures'
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
