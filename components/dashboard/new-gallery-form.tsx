'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCreateGallery } from '@/lib/hooks/use-galleries'

// ── Plantillas ────────────────────────────────────────────────────────────────

const TEMPLATES = [
  { key: 'white-cube-8', label: 'White Cube', slots: 8,  desc: '7 paredes · 1 pedestal', soon: false },
  { key: 'long-hall-12', label: 'Long Hall',  slots: 12, desc: '12 posiciones · pasillo', soon: true  },
  { key: 'open-room-6',  label: 'Open Room',  slots: 6,  desc: '6 posiciones · abierta',  soon: true  },
] as const

// ── SVG: perspectiva interior de la galería (vista desde la entrada) ──────────
// Proyección de un punto (VP central) que muestra el espacio 3D real.

function GalleryInteriorSVG({ active }: { active: boolean }) {
  const wall = active ? 'var(--color-gold)' : 'oklch(14% 0.010 75 / 0.18)'
  const art  = active ? 'var(--color-gold)' : 'oklch(14% 0.010 75 / 0.38)'

  return (
    <svg viewBox="0 0 300 200" fill="none" className="w-full max-w-sm" aria-hidden="true">
      {/* ── Marco de entrada (primer plano) ── */}
      <rect x="8" y="8" width="284" height="184" stroke={wall} strokeWidth="2" />

      {/* ── Pared del fondo ── */}
      <rect x="96" y="58" width="108" height="76" stroke={wall} strokeWidth="1.5" />

      {/* ── Líneas de perspectiva: esquinas → pared del fondo ── */}
      <line x1="8"   y1="8"   x2="96"  y2="58"  stroke={wall} strokeWidth="0.75" />
      <line x1="292" y1="8"   x2="204" y2="58"  stroke={wall} strokeWidth="0.75" />
      <line x1="8"   y1="192" x2="96"  y2="134" stroke={wall} strokeWidth="0.75" />
      <line x1="292" y1="192" x2="204" y2="134" stroke={wall} strokeWidth="0.75" />

      {/* ── Suelo: líneas de perspectiva ── */}
      <line x1="8"   y1="192" x2="292" y2="192" stroke={wall} strokeWidth="1.2" />

      {/* ── Techo: línea de luz central ── */}
      <line x1="128" y1="11"  x2="172" y2="11"  stroke={art} strokeWidth="3" strokeLinecap="round" />
      <line x1="128" y1="11"  x2="96"  y2="58"  stroke={art} strokeWidth="0.5" strokeDasharray="3 4" />
      <line x1="172" y1="11"  x2="204" y2="58"  stroke={art} strokeWidth="0.5" strokeDasharray="3 4" />

      {/* ── Obras pared del fondo — 3 cuadros ── */}
      <rect x="107" y="70"  width="22" height="28" stroke={art} strokeWidth="1.8" />
      <rect x="139" y="70"  width="22" height="28" stroke={art} strokeWidth="1.8" />
      <rect x="171" y="70"  width="22" height="28" stroke={art} strokeWidth="1.8" />

      {/* ── Obras pared izquierda — 2 cuadros (en perspectiva) ── */}
      <rect x="14"  y="60"  width="32" height="42" stroke={art} strokeWidth="1.8" />
      <rect x="50"  y="62"  width="26" height="38" stroke={art} strokeWidth="1.8" />

      {/* ── Obras pared derecha — 2 cuadros (en perspectiva, espejados) ── */}
      <rect x="224" y="62"  width="26" height="38" stroke={art} strokeWidth="1.8" />
      <rect x="254" y="60"  width="32" height="42" stroke={art} strokeWidth="1.8" />

      {/* ── Pedestal central (escultura, en el suelo) ── */}
      <rect x="128" y="126" width="44" height="30" stroke={art} strokeWidth="1.5" strokeDasharray="4 2.5" />
      <text x="150" y="143" textAnchor="middle" dominantBaseline="middle" fontSize="10" fill={art}>◇</text>

      {/* ── Sombra pedestal (perspectiva) ── */}
      <ellipse cx="150" cy="162" rx="24" ry="5" stroke={art} strokeWidth="0.75" opacity="0.4" />
    </svg>
  )
}

// ── SVG mini-planta para los botones de plantilla ────────────────────────────

function MiniPlanWhiteCube({ active }: { active: boolean }) {
  const c = active ? 'var(--color-gold)' : 'oklch(14% 0.010 75 / 0.35)'
  return (
    <svg viewBox="0 0 40 30" fill="none" width="40" height="30">
      <rect x="3" y="3" width="34" height="24" stroke={c} strokeWidth="1.2" />
      {[11, 20, 29].map(x => <line key={x} x1={x} y1="3" x2={x} y2="7" stroke={c} strokeWidth="1.5" strokeLinecap="round" />)}
      {[10, 18].map(y => <line key={y} x1="3" y1={y} x2="7" y2={y} stroke={c} strokeWidth="1.5" strokeLinecap="round" />)}
      <rect x="16" y="12" width="8" height="8" stroke={c} strokeWidth="0.8" strokeDasharray="2 1.5" />
    </svg>
  )
}

function MiniPlanLongHall({ active }: { active: boolean }) {
  const c = active ? 'var(--color-gold)' : 'oklch(14% 0.010 75 / 0.35)'
  return (
    <svg viewBox="0 0 40 30" fill="none" width="40" height="30">
      <rect x="3" y="8" width="34" height="14" stroke={c} strokeWidth="1.2" />
      {[9, 16, 24, 31].map(x => <line key={x} x1={x} y1="8" x2={x} y2="12" stroke={c} strokeWidth="1.5" strokeLinecap="round" />)}
      {[9, 16, 24, 31].map(x => <line key={x+100} x1={x} y1="22" x2={x} y2="18" stroke={c} strokeWidth="1.5" strokeLinecap="round" />)}
    </svg>
  )
}

function MiniPlanOpenRoom({ active }: { active: boolean }) {
  const c = active ? 'var(--color-gold)' : 'oklch(14% 0.010 75 / 0.35)'
  return (
    <svg viewBox="0 0 40 30" fill="none" width="40" height="30">
      <path d="M 3 3 L 37 3 L 37 27 L 20 27 M 20 27 L 3 27 L 3 3" stroke={c} strokeWidth="1.2" />
      {[11, 20, 29].map(x => <line key={x} x1={x} y1="3" x2={x} y2="7" stroke={c} strokeWidth="1.5" strokeLinecap="round" />)}
      <line x1="3" y1="13" x2="7" y2="13" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="37" y1="13" x2="33" y2="13" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

const MINI_PLANS = {
  'white-cube-8': MiniPlanWhiteCube,
  'long-hall-12': MiniPlanLongHall,
  'open-room-6':  MiniPlanOpenRoom,
} as const

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <span className="text-[9px] tracking-[3px] uppercase text-ink3 shrink-0">{children}</span>
      <span className="flex-1 h-px bg-(--border)" />
    </div>
  )
}

const inputBase = 'w-full py-3 border-b bg-transparent text-[15px] text-ink placeholder:text-ink3 outline-none transition-colors'
const inputIdle = `${inputBase} border-(--border) focus:border-ink2`

// ── Componente principal ──────────────────────────────────────────────────────

export function NewGalleryForm() {
  const router        = useRouter()
  const createGallery = useCreateGallery()

  const [name,        setName]       = useState('')
  const [description, setDescription] = useState('')
  const [visibility,  setVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PRIVATE')
  const [template,    setTemplate]   = useState('white-cube-8')
  const [nameError,   setNameError]  = useState('')
  const [apiError,    setApiError]   = useState('')

  const handleSubmit = async (ev: { preventDefault(): void }) => {
    ev.preventDefault()
    if (!name.trim()) { setNameError('El nombre es obligatorio'); return }
    setNameError('')
    setApiError('')

    createGallery.mutate(
      { name: name.trim(), description: description.trim() || undefined, visibility },
      {
        onSuccess: () => router.push('/dashboard/galleries'),
        onError:   (err) => setApiError(err.message),
      },
    )
  }

  const activeTemplate = TEMPLATES.find(t => t.key === template) ?? TEMPLATES[0]

  return (
    <form onSubmit={handleSubmit} className="flex-1 md:grid md:grid-cols-[1fr_420px]">

      {/* ── Izquierda: vista inmersiva de la sala ── */}
      <div className="relative bg-bg2 border-r border-(--border) flex flex-col items-center justify-center px-12 py-14 min-h-150 max-md:px-6 overflow-hidden">

        {/* Marcas de esquina — estilo marco de galería */}
        <span className="absolute top-6 left-6 w-7 h-7 border-t border-l border-(--border-md)" />
        <span className="absolute top-6 right-6 w-7 h-7 border-t border-r border-(--border-md)" />
        <span className="absolute bottom-6 left-6 w-7 h-7 border-b border-l border-(--border-md)" />
        <span className="absolute bottom-6 right-6 w-7 h-7 border-b border-r border-(--border-md)" />

        {/* Vista perspectiva interior */}
        <div className="w-full max-w-sm mb-8 reveal">
          <GalleryInteriorSVG active={template === 'white-cube-8'} />
        </div>

        {/* Nombre + descripción de la plantilla activa */}
        <div className="text-center mb-8 reveal rd1">
          <p className="font-serif text-[24px] font-bold mb-1">{activeTemplate.label}</p>
          <p className="text-[13px] text-ink3">{activeTemplate.desc}</p>
        </div>

        {/* Selector de plantillas con mini-planta */}
        <div className="flex gap-2.5 reveal rd2">
          {TEMPLATES.map(t => {
            const MiniPlan = MINI_PLANS[t.key]
            return (
              <button
                key={t.key}
                type="button"
                disabled={t.soon}
                onClick={() => { if (!t.soon) setTemplate(t.key) }}
                className={`relative flex flex-col items-center gap-2 px-4 py-3 border transition-all ${
                  t.soon
                    ? 'border-(--border) opacity-35 cursor-not-allowed'
                    : template === t.key
                      ? 'border-gold bg-(--gold-dim)'
                      : 'border-(--border) hover:border-(--border-md) hover:bg-bg3'
                }`}
              >
                <MiniPlan active={template === t.key && !t.soon} />
                <span className={`text-[11px] font-medium ${template === t.key && !t.soon ? 'text-gold' : 'text-ink3'}`}>
                  {t.label}
                </span>
                {t.soon && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[7px] tracking-[1.5px] uppercase px-1.5 py-0.5 bg-bg2 border border-(--border) text-ink3 whitespace-nowrap">
                    Pronto
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Derecha: datos de la galería ── */}
      <div className="overflow-y-auto px-10 py-12 max-md:px-6 max-md:py-8 md:sticky md:top-14.25 md:h-[calc(100vh-57px)]">

        {/* Badge de contexto: qué está creando el usuario */}
        <div className="flex items-center gap-2 mb-8 reveal">
          <span className="text-gold text-[13px]">◇</span>
          <span className="text-[11px] tracking-[1.5px] uppercase text-ink3">
            {activeTemplate.slots} posiciones · {activeTemplate.label}
          </span>
        </div>

        {/* Nombre — campo protagonista */}
        <div className="mb-10 reveal">
          <input
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setNameError('') }}
            placeholder="Nombre de la galería"
            className={`w-full pb-3 pt-1 border-b bg-transparent text-[26px] font-serif font-bold text-ink placeholder:text-ink3 placeholder:font-normal outline-none transition-colors leading-tight ${
              nameError ? 'border-warn' : 'border-(--border) focus:border-ink2'
            }`}
          />
          {nameError && <p className="text-[12px] mt-1.5 text-warn">{nameError}</p>}
        </div>

        {/* ── URL pública ── */}
        <div className="mb-8 reveal rd1">
          <SectionLabel>URL pública</SectionLabel>
          <div className="flex items-end border-b border-(--border) pb-3">
            <span className="text-[13px] text-ink3 shrink-0 pb-px">arvista.art/galleries/</span>
            <span className="text-[15px] text-ink font-medium min-w-15">
              {slugify(name) || <span className="text-ink3 font-normal italic">mi-galeria</span>}
            </span>
          </div>
          <p className="text-[11px] text-ink3 mt-2 opacity-60">Generado a partir del nombre.</p>
        </div>

        {/* ── Descripción ── */}
        <div className="mb-8 reveal rd1">
          <SectionLabel>Descripción</SectionLabel>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            maxLength={400}
            placeholder="Una breve descripción de esta galería…"
            className={`${inputIdle} resize-none leading-[1.8]`}
          />
          <p className="text-[11px] text-ink3 mt-2 opacity-50 text-right">{description.length} / 400</p>
        </div>

        {/* ── Visibilidad ── */}
        <div className="mb-8 reveal rd2">
          <SectionLabel>Visibilidad</SectionLabel>
          <div className="grid grid-cols-2 gap-3 mb-3">
            {(['PUBLIC', 'PRIVATE'] as const).map(v => (
              <button
                key={v}
                type="button"
                onClick={() => setVisibility(v)}
                className={`text-left p-4 border transition-all ${
                  visibility === v
                    ? v === 'PUBLIC' ? 'border-ok bg-(--ok-dim)' : 'border-gold bg-(--gold-dim)'
                    : 'border-(--border) hover:border-(--border-md) hover:bg-bg2'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[11px] tracking-[1.5px] uppercase font-medium ${
                    visibility === v ? (v === 'PUBLIC' ? 'text-ok' : 'text-gold') : 'text-ink2'
                  }`}>
                    {v === 'PUBLIC' ? '◎ Pública' : '◈ Privada'}
                  </span>
                  {visibility === v && (
                    <span className={`text-[10px] tracking-[1px] uppercase font-medium ${v === 'PUBLIC' ? 'text-ok' : 'text-gold'}`}>
                      ✓
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-ink3 leading-normal">
                  {v === 'PUBLIC' ? 'Visible para visitantes' : 'Solo visible para ti'}
                </p>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-ink3 opacity-60 leading-normal">
            {visibility === 'PRIVATE'
              ? 'Úsala como borrador mientras preparas las obras. Podrás publicarla en cualquier momento.'
              : 'Cualquier visitante podrá encontrar y recorrer tu galería.'}
          </p>
        </div>

        {apiError && (
          <p
            className="mb-6 text-[13px] text-warn border-l-2 pl-4 py-2"
            style={{ borderLeftColor: 'oklch(62% 0.18 32 / 0.5)', background: 'oklch(62% 0.18 32 / 0.04)' }}
          >
            {apiError}
          </p>
        )}

        {/* ── Acciones ── */}
        <div className="flex gap-3 pt-6 border-t border-(--border) reveal rd3">
          <Link
            href="/dashboard/galleries"
            className="text-[13px] px-4 py-2.5 border border-(--border) text-ink3 no-underline hover:border-(--border-md) hover:text-ink transition-all"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={createGallery.isPending}
            className="ml-auto relative overflow-hidden text-[13px] px-6 py-2.5 text-bg bg-ink font-medium hover:-translate-y-px transition-all ease-[cubic-bezier(.22,1,.36,1)] group disabled:opacity-50"
          >
            <span className="absolute inset-0 bg-gold -translate-x-full group-hover:translate-x-0 transition-transform duration-400 ease-[cubic-bezier(.22,1,.36,1)]" />
            <span className="relative z-1">
              {createGallery.isPending ? 'Creando…' : 'Crear galería →'}
            </span>
          </button>
        </div>
      </div>
    </form>
  )
}
