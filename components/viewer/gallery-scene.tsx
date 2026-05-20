'use client'

import { OrbitControls } from '@react-three/drei'
import { ArtworkWallSlot } from './artwork-wall-slot'
import type { GalleryManifest, SlotManifest } from '@/types/manifest'

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

const WALL_COLOR  = '#f0ede8'
const BASE_COLOR  = '#eae6e0'  // baseboard — slightly lighter
const TRIM_COLOR  = '#e4e0da'  // picture rail / cornice

interface Props {
  manifest:   GalleryManifest
  selectedId: string | null
  onSelect:   (slot: SlotManifest) => void
}

export function GalleryScene({ manifest, selectedId, onSelect }: Props) {
  const wallCol  = manifest.gallery.config.wallColor     ?? WALL_COLOR
  const floorMat = FLOOR_MATS[manifest.gallery.config.floorMaterial ?? 'concrete']

  return (
    <>
      {/* ── Lighting ── */}
      <ambientLight intensity={0.28} color="#fff8f2" />

      {/* Key directional — casts room shadows */}
      <directionalLight
        position={[3, 6, 4]}
        intensity={0.85}
        color="#fff5e8"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
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
          intensity={13}
          color="#fff8e8"
          decay={2.5}
          distance={2.8}
        />
      ))}

      {/* Sculpture pedestal accent — angled from ceiling to illuminate the piece */}
      <pointLight position={[0.5, 2.7, -0.2]} intensity={16} color="#fff8e0" decay={2.5} distance={2.8} />

      {/* South-wall fill — keeps the entrance panels from going dark */}
      <pointLight position={[0, 1.8, 4.3]} intensity={5} color="#fff0d0" decay={2} distance={3.5} />

      {/* Entrance outside glow — suggests a lit corridor beyond the doorway */}
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
      {/* Left panel  (x: −5 → −1.2) */}
      <mesh rotation={[0, Math.PI, 0]} position={[-3.1, 1.6, 4.99]}>
        <planeGeometry args={[3.8, 3.2]} />
        <meshStandardMaterial color={wallCol} roughness={0.90} />
      </mesh>
      {/* Right panel (x: +1.2 → +5) */}
      <mesh rotation={[0, Math.PI, 0]} position={[3.1, 1.6, 4.99]}>
        <planeGeometry args={[3.8, 3.2]} />
        <meshStandardMaterial color={wallCol} roughness={0.90} />
      </mesh>
      {/* Top beam above doorway (y: 2.8 → 3.2) */}
      <mesh rotation={[0, Math.PI, 0]} position={[0, 3.0, 4.99]}>
        <planeGeometry args={[2.4, 0.4]} />
        <meshStandardMaterial color={wallCol} roughness={0.90} />
      </mesh>

      {/* ── Entrance door frame — dark bronze molding, premium architectural detail ── */}
      {/* Left vertical jamb */}
      <mesh position={[-1.22, 1.40, 4.97]}>
        <boxGeometry args={[0.10, 2.84, 0.12]} />
        <meshStandardMaterial color="#1c1810" roughness={0.22} metalness={0.65} />
      </mesh>
      {/* Right vertical jamb */}
      <mesh position={[1.22, 1.40, 4.97]}>
        <boxGeometry args={[0.10, 2.84, 0.12]} />
        <meshStandardMaterial color="#1c1810" roughness={0.22} metalness={0.65} />
      </mesh>
      {/* Lintel (top horizontal bar) */}
      <mesh position={[0, 2.86, 4.97]}>
        <boxGeometry args={[2.64, 0.10, 0.12]} />
        <meshStandardMaterial color="#1c1810" roughness={0.22} metalness={0.65} />
      </mesh>
      {/* Floor threshold — contrasting stone strip */}
      <mesh position={[0, 0.015, 4.92]}>
        <boxGeometry args={[2.40, 0.03, 0.20]} />
        <meshStandardMaterial color="#a8a49c" roughness={0.55} metalness={0.08} />
      </mesh>

      {/* ── Baseboards — 0.18 m high, 0.04 m proud of wall ── */}
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
      {/* South wall baseboards around entrance */}
      <mesh position={[-3.1, 0.09, 4.98]}>
        <boxGeometry args={[3.8, 0.18, 0.05]} />
        <meshStandardMaterial color={BASE_COLOR} roughness={0.85} />
      </mesh>
      <mesh position={[3.1, 0.09, 4.98]}>
        <boxGeometry args={[3.8, 0.18, 0.05]} />
        <meshStandardMaterial color={BASE_COLOR} roughness={0.85} />
      </mesh>

      {/* ── Picture rails — at 2.52 m, narrow ledge where pictures can hang ── */}
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

      {/* ── Ceiling cornice — thin strip where wall meets ceiling ── */}
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

      {/* ── Ceiling track lights — 2 parallel N-S rails with fixture heads ── */}
      {([-1.9, 1.9] as const).map(x => (
        <group key={x}>
          {/* Rail */}
          <mesh position={[x, 3.17, -0.5]}>
            <boxGeometry args={[0.05, 0.03, 9]} />
            <meshStandardMaterial color="#201e18" roughness={0.35} metalness={0.75} />
          </mesh>
          {/* Fixture heads */}
          {([-4.0, -2.4, -0.7, 0.9, 2.4] as const).map(z => (
            <group key={z} position={[x, 3.14, z]}>
              <mesh>
                <boxGeometry args={[0.09, 0.09, 0.09]} />
                <meshStandardMaterial color="#18160f" roughness={0.25} metalness={0.85} />
              </mesh>
              {/* Tiny lens glow */}
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
              {/* Pedestal base — wider foot */}
              <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.60, 0.08, 0.60]} />
                <meshStandardMaterial color="#c4c0b8" roughness={0.72} metalness={0.07} />
              </mesh>
              {/* Pedestal body */}
              <mesh position={[0, 0.60, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.44, 1.04, 0.44]} />
                <meshStandardMaterial color="#d0ccc4" roughness={0.76} metalness={0.05} />
              </mesh>
              {/* Pedestal top cap */}
              <mesh position={[0, 1.14, 0]} receiveShadow>
                <boxGeometry args={[0.52, 0.04, 0.52]} />
                <meshStandardMaterial color="#c4c0b8" roughness={0.70} metalness={0.08} />
              </mesh>
              {/* Sculpture */}
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
