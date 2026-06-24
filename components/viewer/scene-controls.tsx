'use client'

import { useState, useEffect, useRef } from 'react'
import type { SceneParams } from './gallery-scene'

const BG       = 'oklch(13% 0.012 75)'
const GOLD     = 'oklch(60% 0.130 82)'
const GOLD_DIM = 'oklch(60% 0.130 82 / 0.16)'
const GOLD_MID = 'oklch(60% 0.130 82 / 0.35)'
const TEXT     = 'oklch(94% 0.005 75)'
const MUTED    = 'oklch(65% 0.008 75)'
const BORDER   = 'oklch(60% 0.130 82 / 0.14)'

const WALL_PRESETS = [
  { label: 'Blanco galería', color: '#f0ede8' },
  { label: 'Crema cálida',   color: '#e8e0d0' },
  { label: 'Papel antiguo',  color: '#d4c8b8' },
  { label: 'Museo oscuro',   color: '#2c2c2c' },
  { label: 'Verde bosque',   color: '#1a3a2a' },
]

function SectionTitle({ children }: { children: string }) {
  return (
    <p className="text-[9px] tracking-[3px] uppercase mb-3" style={{ color: GOLD_MID }}>
      {children}
    </p>
  )
}

function Slider({
  label, value, min, max, step, decimals = 2, onChange,
}: {
  label: string; value: number; min: number; max: number
  step: number; decimals?: number; onChange: (v: number) => void
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <div className="flex justify-between text-[11px]">
        <span style={{ color: MUTED, letterSpacing: '1px', textTransform: 'uppercase' }}>{label}</span>
        <span style={{ color: TEXT, fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
          {value.toFixed(decimals)}
        </span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-[3px] rounded cursor-pointer"
        style={{ accentColor: GOLD }}
      />
    </label>
  )
}

function ToggleRow({ label, value, onChange }: {
  label: string; value: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <SectionTitle>{label}</SectionTitle>
      <button
        onClick={() => onChange(!value)}
        className="w-9 h-5 rounded-full relative transition-colors shrink-0 -mt-3"
        style={{
          background: value ? GOLD : 'oklch(60% 0.130 82 / 0.12)',
          border: `1px solid ${value ? GOLD : BORDER}`,
        }}
      >
        <span
          className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
          style={{ left: value ? '18px' : '2px', background: TEXT }}
        />
      </button>
    </div>
  )
}

function ChipGroup<T extends string>({
  options, value, onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex gap-[5px]">
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className="flex-1 text-[10px] py-[6px] rounded-xs transition-colors"
          style={{
            border:     `1px solid ${value === o.value ? GOLD : BORDER}`,
            color:      value === o.value ? GOLD : MUTED,
            background: value === o.value ? GOLD_DIM : 'transparent',
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

interface Props {
  params:     SceneParams
  onChange:   (patch: Partial<SceneParams>) => void
  onReset:    () => void
  isOwner?:   boolean
  isDirty?:   boolean
  isSaving?:  boolean
  saveError?: string
  onSave?:    () => void
}

export function SceneControls({ params, onChange, onReset, isOwner, isDirty, isSaving, saveError, onSave }: Props) {
  const [open,    setOpen]    = useState(false)
  const [savedOk, setSavedOk] = useState(false)
  const prevSavingRef         = useRef(false)

  useEffect(() => {
    if (prevSavingRef.current && !isSaving && !saveError && !isDirty) {
      setSavedOk(true)
      const t = setTimeout(() => setSavedOk(false), 2000)
      return () => clearTimeout(t)
    }
    prevSavingRef.current = !!isSaving
  }, [isSaving, saveError, isDirty])

  return (
    // Bottom-left to avoid overlap with the artwork detail panel (right side)
    <div className="absolute bottom-5 left-5 z-30 flex flex-col items-start gap-2 select-none">
      {open && (
        <div
          className="w-64 rounded-xs shadow-2xl overflow-hidden"
          style={{ background: BG, border: `1px solid ${BORDER}` }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: `1px solid ${BORDER}` }}
          >
            <span className="text-[9px] tracking-[4px] uppercase" style={{ color: GOLD }}>
              Escena
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-[18px] leading-none transition-opacity opacity-40 hover:opacity-100"
              style={{ color: TEXT }}
            >
              ×
            </button>
          </div>

          {/* Body */}
          <div className="px-4 py-4 flex flex-col gap-5 overflow-y-auto max-h-[72vh]">

            {/* Iluminación */}
            <section>
              <SectionTitle>Iluminación</SectionTitle>
              <div className="flex flex-col gap-3">
                <Slider label="Ambiente"   value={params.ambientIntensity}  min={0}   max={1.5} step={0.01} onChange={v => onChange({ ambientIntensity: v })} />
                <Slider label="Principal"  value={params.keyLightIntensity} min={0}   max={2.5} step={0.05} onChange={v => onChange({ keyLightIntensity: v })} />
                <Slider label="Focos obra" value={params.accentIntensity}   min={0}   max={30}  step={0.5}  decimals={1} onChange={v => onChange({ accentIntensity: v })} />
                <Slider label="Exposición" value={params.exposure}          min={0.5} max={1.8} step={0.05} onChange={v => onChange({ exposure: v })} />
              </div>
            </section>

            {/* Color de pared */}
            <section>
              <SectionTitle>Color de pared</SectionTitle>
              <div className="flex gap-2">
                {WALL_PRESETS.map(p => (
                  <button
                    key={p.color}
                    title={p.label}
                    onClick={() => onChange({ wallColor: p.color })}
                    className="w-7 h-7 rounded-xs transition-transform hover:scale-110"
                    style={{
                      background:    p.color,
                      outline:       `2px solid ${params.wallColor === p.color ? GOLD : 'transparent'}`,
                      outlineOffset: '2px',
                    }}
                  />
                ))}
              </div>
            </section>

            {/* Suelo */}
            <section>
              <SectionTitle>Suelo</SectionTitle>
              <ChipGroup
                value={params.floorMaterial}
                onChange={v => onChange({ floorMaterial: v })}
                options={[
                  { value: 'concrete', label: 'Concreto' },
                  { value: 'parquet',  label: 'Parqué'   },
                  { value: 'marble',   label: 'Mármol'   },
                ]}
              />
            </section>

            {/* Alfombra */}
            <section>
              <ToggleRow label="Alfombra" value={params.rugVisible} onChange={v => onChange({ rugVisible: v })} />
              {params.rugVisible && (
                <ChipGroup
                  value={params.rugStyle}
                  onChange={v => onChange({ rugStyle: v })}
                  options={[
                    { value: 'classic', label: 'Clásica' },
                    { value: 'minimal', label: 'Minimal' },
                    { value: 'dark',    label: 'Oscura'  },
                  ]}
                />
              )}
            </section>

            {/* Niebla */}
            <section>
              <SectionTitle>Niebla</SectionTitle>
              <div className="flex flex-col gap-3">
                <Slider label="Inicio" value={params.fogNear} min={4}  max={15} step={0.5} decimals={1} onChange={v => onChange({ fogNear: v })} />
                <Slider label="Final"  value={params.fogFar}  min={10} max={40} step={0.5} decimals={1} onChange={v => onChange({ fogFar: v })} />
              </div>
            </section>

            {/* Acciones */}
            <div className="flex flex-col gap-2 mt-1">
              {isOwner && isDirty && onSave && (
                <>
                  <button
                    onClick={onSave}
                    disabled={isSaving}
                    className="w-full text-[11px] py-2 rounded-xs transition-colors"
                    style={{
                      background: isSaving ? GOLD_DIM : GOLD,
                      color:      isSaving ? MUTED : BG,
                      border:     `1px solid ${GOLD}`,
                      opacity:    isSaving ? 0.7 : 1,
                    }}
                  >
                    {isSaving ? 'Guardando…' : 'Guardar configuración'}
                  </button>
                  {saveError && (
                    <p className="text-[10px] text-center" style={{ color: 'oklch(62% 0.18 32)' }}>
                      {saveError}
                    </p>
                  )}
                </>
              )}
              {isOwner && savedOk && !isDirty && (
                <p className="text-[11px] text-center py-1" style={{ color: 'oklch(56% 0.14 155)' }}>
                  ✓ Guardado
                </p>
              )}
              <button
                onClick={onReset}
                className="w-full text-[11px] py-2 rounded-xs transition-colors"
                style={{ border: `1px solid ${BORDER}`, color: MUTED }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.color = GOLD }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = MUTED }}
              >
                Restablecer todo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Controles de escena"
        aria-expanded={open}
        className="w-9 h-9 flex items-center justify-center text-[15px] rounded-xs transition-all hover:-translate-y-px"
        title="Controles de escena"
        style={{
          background:     open ? GOLD_DIM : BG,
          border:         `1px solid ${open ? GOLD : BORDER}`,
          color:          GOLD,
          backdropFilter: 'blur(8px)',
        }}
      >
        ⚙
      </button>
    </div>
  )
}
