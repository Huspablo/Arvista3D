'use client'

import { useEffect, useRef, useState } from 'react'
import { useUpdateGallery, type GalleryWithCount } from '@/lib/hooks/use-galleries'
import { useFocusTrap } from '@/lib/hooks/use-focus-trap'
import type { FloorMaterial, LightingPreset } from '@prisma/client'

const FLOOR_OPTIONS: { value: FloorMaterial; label: string }[] = [
  { value: 'CONCRETE', label: 'Hormigón' },
  { value: 'PARQUET',  label: 'Parquet'  },
  { value: 'MARBLE',   label: 'Mármol'   },
]

const LIGHTING_OPTIONS: { value: LightingPreset; label: string }[] = [
  { value: 'WARM',     label: 'Cálida'    },
  { value: 'NEUTRAL',  label: 'Neutra'    },
  { value: 'DRAMATIC', label: 'Dramática' },
]

const WALL_PRESETS = [
  { hex: '#FFFFFF', label: 'Blanco puro'  },
  { hex: '#F5F0E8', label: 'Crema'        },
  { hex: '#E0D8D0', label: 'Gris cálido'  },
  { hex: '#BFBAB4', label: 'Piedra'       },
  { hex: '#2C2C2C', label: 'Carbón'       },
  { hex: '#1B2A3B', label: 'Noche'        },
  { hex: '#2D4A3E', label: 'Bosque'       },
  { hex: '#7A3B2E', label: 'Terracota'    },
]

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-5">
      <span className="text-[9px] tracking-[3px] uppercase text-ink3 shrink-0">{children}</span>
      <span className="flex-1 h-px bg-(--border)" />
    </div>
  )
}

interface Props {
  gallery: GalleryWithCount | null
  onClose: () => void
}

export function EditGalleryPanel({ gallery, onClose }: Props) {
  const updateGallery = useUpdateGallery()
  const panelRef      = useRef<HTMLDivElement>(null)
  useFocusTrap(panelRef, !!gallery)

  const [name,        setName]       = useState('')
  const [description, setDescription] = useState('')
  const [visibility,  setVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PRIVATE')
  const [wallColor,   setWallColor]  = useState<string | null>(null)
  const [floor,       setFloor]      = useState<FloorMaterial>('CONCRETE')
  const [lighting,    setLighting]   = useState<LightingPreset>('NEUTRAL')
  const [nameError,   setNameError]  = useState('')
  const [apiError,    setApiError]   = useState('')

  // Populate fields whenever the target gallery changes
  useEffect(() => {
    if (!gallery) return
    setName(gallery.name)
    setDescription(gallery.description ?? '')
    setVisibility(gallery.visibility)
    setWallColor(gallery.wallColor ?? null)
    setFloor(gallery.floorMaterial)
    setLighting(gallery.lightingPreset)
    setNameError('')
    setApiError('')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gallery?.id])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleSave = () => {
    if (!gallery) return
    if (!name.trim()) { setNameError('El nombre es obligatorio'); return }
    setNameError('')
    setApiError('')

    updateGallery.mutate(
      {
        id:            gallery.id,
        name:          name.trim(),
        description:   description.trim() || undefined,
        visibility,
        wallColor:     wallColor ?? undefined,
        floorMaterial: floor,
        lightingPreset: lighting,
      },
      {
        onSuccess: () => onClose(),
        onError:   (err) => setApiError(err.message),
      },
    )
  }

  const isOpen = !!gallery

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-40 transition-[opacity,backdrop-filter] duration-350"
        style={{
          background:     'oklch(14% 0.010 75 / 0.40)',
          backdropFilter: 'blur(3px)',
          opacity:        isOpen ? 1 : 0,
          pointerEvents:  isOpen ? 'auto' : 'none',
        }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Editar galería"
        className="fixed right-0 top-0 h-full z-50 w-full max-w-md bg-bg border-l border-(--border) shadow-2xl flex flex-col"
        style={{
          transform:  isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.4s cubic-bezier(.22,1,.36,1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-(--border) shrink-0">
          <div className="min-w-0 pr-4">
            <p className="text-[9px] tracking-[3px] uppercase text-gold mb-0.5">◇ Editando galería</p>
            <h2 className="font-serif text-[20px] font-bold leading-tight truncate">{gallery?.name ?? ''}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="w-9 h-9 flex items-center justify-center shrink-0 border border-(--border) text-ink3 text-[14px] hover:border-(--border-md) hover:text-ink transition-all"
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-8 py-8">

          {/* ── Nombre ── */}
          <div className="mb-9">
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setNameError('') }}
              placeholder="Nombre de la galería"
              maxLength={80}
              className={`w-full pb-3 pt-1 border-b bg-transparent text-[22px] font-serif font-bold text-ink placeholder:text-ink3 placeholder:font-normal outline-none transition-colors leading-tight ${
                nameError ? 'border-warn' : 'border-(--border) focus:border-ink2'
              }`}
            />
            {nameError && <p className="text-[12px] mt-1.5 text-warn">{nameError}</p>}
          </div>

          {/* ── Descripción ── */}
          <div className="mb-8">
            <SectionLabel>Descripción</SectionLabel>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              maxLength={400}
              placeholder="Una breve descripción de esta galería…"
              className="w-full py-3 border-b border-(--border) bg-transparent text-[15px] text-ink placeholder:text-ink3 outline-none transition-colors focus:border-ink2 resize-none leading-[1.8]"
            />
            <p className="text-[11px] text-ink3 mt-1.5 opacity-50 text-right">{description.length} / 400</p>
          </div>

          {/* ── Visibilidad ── */}
          <div className="mb-8">
            <SectionLabel>Visibilidad</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              {(['PUBLIC', 'PRIVATE'] as const).map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVisibility(v)}
                  className={`text-left p-4 border transition-all ${
                    visibility === v
                      ? v === 'PUBLIC'
                        ? 'border-ok bg-(--ok-dim)'
                        : 'border-gold bg-(--gold-dim)'
                      : 'border-(--border) hover:border-(--border-md) hover:bg-bg2'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[11px] tracking-[1.5px] uppercase font-medium ${
                      visibility === v ? (v === 'PUBLIC' ? 'text-ok' : 'text-gold') : 'text-ink2'
                    }`}>
                      {v === 'PUBLIC' ? '◎ Pública' : '◈ Privada'}
                    </span>
                    {visibility === v && (
                      <span className={`text-[10px] ${v === 'PUBLIC' ? 'text-ok' : 'text-gold'}`}>✓</span>
                    )}
                  </div>
                  <p className="text-[12px] text-ink3 leading-normal">
                    {v === 'PUBLIC' ? 'Visible para visitantes' : 'Solo visible para ti'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* ── Color de pared ── */}
          <div className="mb-8">
            <SectionLabel>Color de pared</SectionLabel>
            <div className="flex flex-wrap gap-2.5 mb-3">
              {WALL_PRESETS.map(p => (
                <button
                  key={p.hex}
                  type="button"
                  title={p.label}
                  onClick={() => setWallColor(p.hex)}
                  className="w-9 h-9 shrink-0 transition-transform duration-200"
                  style={{
                    background:  p.hex,
                    border:      wallColor === p.hex
                      ? '2px solid var(--color-gold)'
                      : '2px solid oklch(14% 0.010 75 / 0.15)',
                    transform:   wallColor === p.hex ? 'scale(1.18)' : 'scale(1)',
                    boxShadow:   wallColor === p.hex
                      ? '0 0 0 2px var(--color-bg), 0 0 0 4px var(--color-gold)'
                      : 'none',
                  }}
                />
              ))}

              {/* Picker libre */}
              <label
                title="Color personalizado"
                className="w-9 h-9 shrink-0 border-2 border-dashed border-(--border) flex items-center justify-center cursor-pointer hover:border-gold transition-colors relative overflow-hidden"
              >
                <span className="text-[13px] text-ink3 select-none">✦</span>
                <input
                  type="color"
                  value={wallColor ?? '#FFFFFF'}
                  onChange={e => setWallColor(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </label>
            </div>

            {/* Preview del color actual */}
            <div className="flex items-center gap-2.5 text-[12px] text-ink3">
              <span
                className="w-4 h-4 shrink-0 border border-(--border-md)"
                style={{ background: wallColor ?? 'transparent' }}
              />
              <span className="font-mono">{wallColor ?? 'Sin color'}</span>
              {wallColor && (
                <button
                  type="button"
                  onClick={() => setWallColor(null)}
                  className="text-ink3 hover:text-ink transition-colors ml-1"
                >
                  × Quitar
                </button>
              )}
            </div>
          </div>

          {/* ── Material de suelo ── */}
          <div className="mb-8">
            <SectionLabel>Material de suelo</SectionLabel>
            <div className="flex gap-2">
              {FLOOR_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFloor(opt.value)}
                  className={`flex-1 py-2.5 text-[12px] border transition-all ${
                    floor === opt.value
                      ? 'border-gold text-gold bg-(--gold-dim)'
                      : 'border-(--border) text-ink3 hover:border-(--border-md) hover:text-ink'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Iluminación ── */}
          <div className="mb-8">
            <SectionLabel>Iluminación</SectionLabel>
            <div className="flex gap-2">
              {LIGHTING_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setLighting(opt.value)}
                  className={`flex-1 py-2.5 text-[12px] border transition-all ${
                    lighting === opt.value
                      ? 'border-gold text-gold bg-(--gold-dim)'
                      : 'border-(--border) text-ink3 hover:border-(--border-md) hover:text-ink'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {apiError && (
            <p
              className="text-[13px] text-warn border-l-2 pl-4 py-2"
              style={{ borderLeftColor: 'oklch(62% 0.18 32 / 0.5)', background: 'oklch(62% 0.18 32 / 0.04)' }}
            >
              {apiError}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-8 py-5 border-t border-(--border) shrink-0">
          <button
            onClick={onClose}
            className="text-[13px] px-5 py-2.5 border border-(--border) text-ink3 hover:border-(--border-md) hover:text-ink transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={updateGallery.isPending}
            className="ml-auto relative overflow-hidden text-[13px] px-7 py-2.5 text-bg bg-ink font-medium hover:-translate-y-px transition-all ease-[cubic-bezier(.22,1,.36,1)] group disabled:opacity-50"
          >
            <span className="absolute inset-0 bg-gold -translate-x-full group-hover:translate-x-0 transition-transform duration-400 ease-[cubic-bezier(.22,1,.36,1)]" />
            <span className="relative z-1">
              {updateGallery.isPending ? 'Guardando…' : 'Guardar cambios →'}
            </span>
          </button>
        </div>
      </div>
    </>
  )
}
