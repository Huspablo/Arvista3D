'use client'

import { useState } from 'react'
import Link from 'next/link'

const TEMPLATES = [
  {
    key:   'white-cube-8',
    label: 'White Cube',
    desc:  '8 posiciones · 3 paredes + pedestal',
    slots: 8,
  },
  {
    key:   'long-hall-12',
    label: 'Long Hall',
    desc:  '12 posiciones · pasillo central',
    slots: 12,
    soon:  true,
  },
  {
    key:   'open-room-6',
    label: 'Open Room',
    desc:  '6 posiciones · sala abierta',
    slots: 6,
    soon:  true,
  },
]

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

interface FormErrors {
  name?:     string
  template?: string
}

export function NewGalleryForm() {
  const [name,        setName]        = useState('')
  const [slug,        setSlug]        = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [description, setDescription] = useState('')
  const [visibility,  setVisibility]  = useState<'public' | 'private'>('public')
  const [template,    setTemplate]    = useState('white-cube-8')
  const [errors,      setErrors]      = useState<FormErrors>({})
  const [submitted,   setSubmitted]   = useState(false)

  const handleNameChange = (v: string) => {
    setName(v)
    if (!slugTouched) setSlug(slugify(v))
    if (errors.name) setErrors(e => ({ ...e, name: undefined }))
  }

  const handleSlugChange = (v: string) => {
    setSlugTouched(true)
    setSlug(slugify(v))
  }

  const validate = () => {
    const e: FormErrors = {}
    if (!name.trim())     e.name     = 'El nombre es obligatorio'
    if (!template)        e.template = 'Elige una plantilla'
    return e
  }

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-6 text-center px-6 reveal">
        <div className="w-16 h-16 border border-ok flex items-center justify-center text-[28px] text-ok">
          ◈
        </div>
        <div>
          <h2 className="font-serif text-[28px] font-bold mb-2">Galería creada</h2>
          <p className="text-[15px] text-ink3">Ya puedes añadir obras y personalizar tu espacio.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/dashboard/artworks?gallery=${slug}`}
            className="relative overflow-hidden text-[13px] px-6 py-2.5 rounded-xs text-bg bg-ink no-underline font-medium hover:-translate-y-px transition-all ease-[cubic-bezier(.22,1,.36,1)] group"
          >
            <span className="absolute inset-0 bg-gold -translate-x-full group-hover:translate-x-0 transition-transform duration-400 ease-[cubic-bezier(.22,1,.36,1)]" />
            <span className="relative z-1">Añadir obras →</span>
          </Link>
          <Link
            href="/dashboard/galleries"
            className="text-[13px] px-6 py-2.5 border border-(--border) rounded-xs text-ink3 no-underline hover:border-(--border-md) hover:text-ink transition-all"
          >
            Ver galerías
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-190 mx-auto px-12 py-10 max-md:px-6">

      {/* Template selector */}
      <section className="mb-10 reveal">
        <h2 className="font-serif text-[20px] font-bold mb-1">Plantilla de sala</h2>
        <p className="text-[13px] text-ink3 mb-5">Define la distribución de obras en el espacio 3D.</p>
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
          {TEMPLATES.map(t => (
            <button
              key={t.key}
              type="button"
              disabled={t.soon}
              onClick={() => { if (!t.soon) { setTemplate(t.key); setErrors(e => ({ ...e, template: undefined })) } }}
              className={`relative text-left border p-5 transition-all ease-[cubic-bezier(.22,1,.36,1)] ${
                t.soon
                  ? 'border-(--border) opacity-40 cursor-not-allowed'
                  : template === t.key
                    ? 'border-gold bg-(--gold-dim)'
                    : 'border-(--border) hover:border-(--border-md) hover:bg-bg2'
              }`}
            >
              {/* Room sketch */}
              <div className="w-full aspect-video mb-4 flex items-center justify-center border border-(--border) bg-bg3 relative overflow-hidden">
                <div
                  className={`w-[60%] h-[55%] border-t border-l border-r ${template === t.key ? 'border-gold opacity-70' : 'border-(--border-md) opacity-50'}`}
                  style={{ borderBottom: 'none' }}
                />
                <div className={`absolute bottom-[22%] left-1/2 -translate-x-1/2 w-[8%] h-[12%] ${template === t.key ? 'bg-gold opacity-50' : 'bg-(--border-md) opacity-40'}`} />
              </div>
              <div className="font-medium text-[14px] mb-1">{t.label}</div>
              <div className="text-[11px] text-ink3">{t.desc}</div>
              {t.soon && (
                <span className="absolute top-3 right-3 text-[9px] tracking-[2px] uppercase px-1.75 py-0.75 bg-(--border) text-ink3 border border-(--border)">
                  Pronto
                </span>
              )}
              {template === t.key && !t.soon && (
                <span className="absolute top-3 right-3 text-gold text-[16px]">◈</span>
              )}
            </button>
          ))}
        </div>
        {errors.template && <p className="text-[12px] text-warn mt-2">{errors.template}</p>}
      </section>

      {/* Basic info */}
      <section className="mb-8 reveal rd1">
        <h2 className="font-serif text-[20px] font-bold mb-5">Información básica</h2>

        <div className="mb-5">
          <label className="block text-[11px] tracking-[2px] uppercase text-ink3 mb-2.5">
            Nombre de la galería <span className="text-warn">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={e => handleNameChange(e.target.value)}
            placeholder="Ej. Texturas urbanas"
            className={`w-full border bg-bg3 text-ink text-[14px] px-4 py-3 outline-none transition-colors placeholder:text-ink3 ${
              errors.name ? 'border-warn' : 'border-(--border) focus:border-(--border-md)'
            }`}
          />
          {errors.name && <p className="text-[12px] text-warn mt-1.5">{errors.name}</p>}
        </div>

        <div className="mb-5">
          <label className="block text-[11px] tracking-[2px] uppercase text-ink3 mb-2.5">
            URL pública
          </label>
          <div className="flex items-stretch border border-(--border) focus-within:border-(--border-md) transition-colors">
            <span className="px-3 py-3 bg-bg2 border-r border-(--border) text-[13px] text-ink3 flex items-center select-none whitespace-nowrap">
              arvista.art/galleries/
            </span>
            <input
              type="text"
              value={slug}
              onChange={e => handleSlugChange(e.target.value)}
              placeholder="mi-galeria"
              className="flex-1 bg-bg3 text-ink text-[14px] px-3 py-3 outline-none placeholder:text-ink3"
            />
          </div>
          <p className="text-[11px] text-ink3 mt-1.5">Se genera automáticamente. Puedes editarlo.</p>
        </div>

        <div>
          <label className="block text-[11px] tracking-[2px] uppercase text-ink3 mb-2.5">
            Descripción
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            placeholder="Una breve descripción de esta galería…"
            className="w-full border border-(--border) bg-bg3 text-ink text-[14px] px-4 py-3 outline-none resize-none focus:border-(--border-md) transition-colors placeholder:text-ink3"
          />
          <p className="text-[11px] text-ink3 mt-1.5">{description.length} / 400 caracteres</p>
        </div>
      </section>

      {/* Visibility */}
      <section className="mb-10 reveal rd2">
        <h2 className="font-serif text-[20px] font-bold mb-2">Visibilidad</h2>
        <p className="text-[13px] text-ink3 mb-5">Las galerías privadas solo son visibles para ti.</p>
        <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
          {(['public', 'private'] as const).map(v => (
            <button
              key={v}
              type="button"
              onClick={() => setVisibility(v)}
              className={`text-left p-5 border transition-all ${
                visibility === v
                  ? v === 'public'
                    ? 'border-ok bg-(--ok-dim)'
                    : 'border-gold bg-(--gold-dim)'
                  : 'border-(--border) hover:border-(--border-md) hover:bg-bg2'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-[14px]">
                  {v === 'public' ? 'Pública' : 'Privada'}
                </span>
                {visibility === v && (
                  <span className={v === 'public' ? 'text-ok' : 'text-gold'}>◈</span>
                )}
              </div>
              <p className="text-[12px] text-ink3">
                {v === 'public'
                  ? 'Visible en el catálogo y para cualquier visitante'
                  : 'Solo tú puedes verla — ideal mientras la preparas'}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Submit */}
      <div className="flex items-center gap-3 reveal rd3">
        <button
          type="submit"
          className="relative overflow-hidden text-[13px] px-7 py-2.75 rounded-xs text-bg bg-ink font-medium hover:-translate-y-px transition-all ease-[cubic-bezier(.22,1,.36,1)] group"
        >
          <span className="absolute inset-0 bg-gold -translate-x-full group-hover:translate-x-0 transition-transform duration-400 ease-[cubic-bezier(.22,1,.36,1)]" />
          <span className="relative z-1">Crear galería</span>
        </button>
        <Link
          href="/dashboard/galleries"
          className="text-[13px] text-ink3 no-underline hover:text-ink transition-colors"
        >
          Cancelar
        </Link>
      </div>
    </form>
  )
}
