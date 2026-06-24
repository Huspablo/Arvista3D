'use client'

import { useState, useRef, ChangeEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUpdateArtwork } from '@/lib/hooks/use-artworks'
import type { Artwork, ArtworkType } from '@prisma/client'

const TYPES: { value: ArtworkType; label: string; symbol: string }[] = [
  { value: 'PAINTING',    label: 'Pintura',    symbol: '▭' },
  { value: 'SCULPTURE',   label: 'Escultura',  symbol: '◇' },
  { value: 'PHOTOGRAPHY', label: 'Fotografía', symbol: '◎' },
  { value: 'OTHER',       label: 'Otro',       symbol: '∷' },
]

interface FormErrors { title?: string; year?: string }

function dimsString(w?: number | null, h?: number | null, d?: number | null): string {
  if (!w && !h) return ''
  return [w, h, d].filter(Boolean).join(' × ')
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[9px] tracking-[2.5px] uppercase text-ink3 mb-1.5 block">{label}</label>
      {children}
      {error && <p className="text-[11px] mt-1 text-warn">{error}</p>}
    </div>
  )
}

const inputCls = 'w-full py-2 border-b border-(--border) focus:border-ink2 bg-transparent text-[14px] text-ink placeholder:text-ink3 outline-none transition-colors'

export function EditArtworkForm({ artwork }: { artwork: Artwork }) {
  const router        = useRouter()
  const updateArtwork = useUpdateArtwork()
  const fileInputRef  = useRef<HTMLInputElement>(null)

  const [title,       setTitle]       = useState(artwork.title)
  const [type,        setType]        = useState<ArtworkType>(artwork.type)
  const [year,        setYear]        = useState(String(artwork.year ?? new Date().getFullYear()))
  const [dims,        setDims]        = useState(dimsString(artwork.dimWidth, artwork.dimHeight, artwork.dimDepth))
  const [technique,   setTechnique]   = useState(artwork.technique ?? '')
  const [edition,     setEdition]     = useState(artwork.edition   ?? '')
  const [description, setDescription] = useState(artwork.description ?? '')
  const [errors,      setErrors]      = useState<FormErrors>({})
  const [apiError,    setApiError]    = useState('')

  const [newPreview,   setNewPreview]   = useState<string | null>(null)
  const [imgUploading, setImgUploading] = useState(false)
  const [imgError,     setImgError]     = useState('')

  const validate = (): boolean => {
    const errs: FormErrors = {}
    if (!title.trim()) errs.title = 'El título es obligatorio'
    if (!year || isNaN(Number(year)) || Number(year) < 1000) errs.year = 'Año inválido'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setImgError('')
    setImgUploading(true)
    setNewPreview(URL.createObjectURL(file))
    try {
      const fd = new FormData()
      fd.append('file',      file)
      fd.append('artworkId', artwork.id)
      const res = await fetch('/api/assets/artwork-upload', { method: 'POST', body: fd })
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(err.error ?? 'Error al subir la imagen')
      }
    } catch (err) {
      setNewPreview(null)
      setImgError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setImgUploading(false)
    }
  }

  const handleSubmit = async (ev: { preventDefault(): void }) => {
    ev.preventDefault()
    if (!validate()) return
    setApiError('')
    const dimMatch = dims.replace(/×/g, 'x').split('x').map(s => parseFloat(s.trim()))
    const [dimWidth, dimHeight, dimDepth] = dimMatch.length >= 2 ? dimMatch : [undefined, undefined, undefined]
    updateArtwork.mutate(
      {
        id: artwork.id, title: title.trim(), type,
        description: description.trim() || undefined,
        year: Number(year),
        technique:  technique.trim() || undefined,
        edition:    edition.trim()   || undefined,
        dimWidth:   dimWidth  && !isNaN(dimWidth)  ? dimWidth  : undefined,
        dimHeight:  dimHeight && !isNaN(dimHeight) ? dimHeight : undefined,
        dimDepth:   dimDepth  && !isNaN(dimDepth)  ? dimDepth  : undefined,
      },
      {
        onSuccess: () => router.push('/dashboard/artworks'),
        onError:   (err) => setApiError(err.message),
      },
    )
  }

  const currentThumb = newPreview ?? artwork.assetThumbnail ?? null

  return (
    <form
      onSubmit={handleSubmit}
      className="px-12 py-10 flex gap-14 max-md:flex-col max-md:px-6 max-md:py-8"
    >
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />

      {/* ── Panel izquierdo: imagen contenida ── */}
      <aside className="w-65 shrink-0 flex flex-col gap-4 self-start md:sticky md:top-14.25 max-md:w-full">

        {/* Contenedor de imagen — cuadrado neutral */}
        <div
          className="relative aspect-square bg-bg2 border border-(--border) overflow-hidden group cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          {/* Marcas de esquina estilo galería */}
          <span className="absolute top-3 left-3 w-3.5 h-3.5 border-t border-l border-(--border-md) z-10" />
          <span className="absolute top-3 right-3 w-3.5 h-3.5 border-t border-r border-(--border-md) z-10" />
          <span className="absolute bottom-3 left-3 w-3.5 h-3.5 border-b border-l border-(--border-md) z-10" />
          <span className="absolute bottom-3 right-3 w-3.5 h-3.5 border-b border-r border-(--border-md) z-10" />

          {currentThumb ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentThumb}
                alt={artwork.title}
                className="absolute inset-0 w-full h-full object-contain p-3 transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.03]"
              />
              {/* Overlay en hover */}
              <div
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ background: 'oklch(14% 0.010 75 / 0.52)' }}
              >
                <span className="text-[10px] tracking-[2px] uppercase text-white border border-white/25 px-4 py-2">
                  {imgUploading ? 'Subiendo…' : 'Cambiar'}
                </span>
              </div>
            </>
          ) : (
            /* Estado vacío */
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <span className="font-serif text-[40px] text-ink opacity-8">◇</span>
              <span className="text-[9px] tracking-[2.5px] uppercase text-ink3 opacity-35">Añadir imagen</span>
            </div>
          )}

          {imgUploading && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none"
              style={{ background: 'oklch(97.5% 0.007 75 / 0.88)' }}
            >
              <div className="w-8 h-px bg-gold animate-pulse" />
              <span className="text-[9px] tracking-[3px] uppercase text-ink3">Subiendo…</span>
            </div>
          )}
        </div>

        {/* Controles bajo la imagen */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={imgUploading}
            onClick={() => fileInputRef.current?.click()}
            className="text-[11px] px-3.5 py-1.75 border border-(--border) text-ink3 hover:border-(--border-md) hover:text-ink transition-all disabled:opacity-50 shrink-0"
          >
            {currentThumb ? 'Cambiar imagen' : '+ Imagen'}
          </button>
          <span className="text-[9px] tracking-[1px] uppercase text-ink3 opacity-30 leading-normal">
            JPG · PNG<br />WebP · 20 MB
          </span>
        </div>

        {imgError && (
          <p className="text-[11px] text-warn">{imgError}</p>
        )}
      </aside>

      {/* ── Formulario ── */}
      <div className="flex-1 max-w-115">

        {/* Título */}
        <div className="mb-8">
          <input
            type="text"
            value={title}
            onChange={e => { setTitle(e.target.value); setErrors(p => ({ ...p, title: undefined })) }}
            placeholder="Título de la obra"
            className={`w-full pb-3 border-b bg-transparent text-[28px] font-serif font-bold text-ink placeholder:text-ink3/50 placeholder:font-normal outline-none transition-colors leading-tight ${
              errors.title ? 'border-warn' : 'border-(--border) focus:border-ink2'
            }`}
          />
          {errors.title && <p className="text-[11px] mt-1.5 text-warn">{errors.title}</p>}
        </div>

        {/* Tipo de obra */}
        <div className="mb-7">
          <p className="text-[9px] tracking-[2.5px] uppercase text-ink3 mb-3">Tipo de obra</p>
          <div className="grid grid-cols-4 gap-2">
            {TYPES.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={`flex flex-col items-center gap-2 py-3.5 border transition-all ${
                  type === t.value
                    ? 'border-gold bg-(--gold-dim) text-gold'
                    : 'border-(--border) text-ink3 hover:border-(--border-md) hover:text-ink'
                }`}
              >
                <span className="text-[18px] leading-none">{t.symbol}</span>
                <span className="text-[9px] tracking-[0.5px] uppercase">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Detalles físicos */}
        <div className="mb-7">
          <p className="text-[9px] tracking-[2.5px] uppercase text-ink3 mb-4">Detalles físicos</p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            <Field label={`Año *`} error={errors.year}>
              <input
                type="number"
                value={year}
                onChange={e => { setYear(e.target.value); setErrors(p => ({ ...p, year: undefined })) }}
                min="1900"
                max={new Date().getFullYear()}
                className={`${inputCls} ${errors.year ? 'border-warn' : ''}`}
              />
            </Field>
            <Field label="Dimensiones">
              <input type="text" value={dims} onChange={e => setDims(e.target.value)} placeholder="80 × 100 cm" className={inputCls} />
            </Field>
            <Field label="Técnica">
              <input type="text" value={technique} onChange={e => setTechnique(e.target.value)} placeholder="Óleo sobre lino" className={inputCls} />
            </Field>
            <Field label="Edición">
              <input type="text" value={edition} onChange={e => setEdition(e.target.value)} placeholder="1 / 3" className={inputCls} />
            </Field>
          </div>
        </div>

        {/* Descripción */}
        <div className="mb-7">
          <p className="text-[9px] tracking-[2.5px] uppercase text-ink3 mb-3">Descripción</p>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Concepto, proceso creativo, contexto…"
            rows={4}
            className={`${inputCls} resize-none leading-relaxed`}
          />
        </div>

        {apiError && (
          <p
            className="mb-6 text-[12px] text-warn border-l-2 pl-4 py-2"
            style={{ borderLeftColor: 'oklch(62% 0.18 32 / 0.5)', background: 'oklch(62% 0.18 32 / 0.04)' }}
          >
            {apiError}
          </p>
        )}

        {/* Acciones */}
        <div className="flex items-center gap-3 pt-6 border-t border-(--border)">
          <Link
            href="/dashboard/artworks"
            className="text-[12px] px-4 py-2.5 border border-(--border) text-ink3 no-underline hover:border-(--border-md) hover:text-ink transition-all"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={updateArtwork.isPending}
            className="ml-auto relative overflow-hidden text-[12px] px-7 py-2.5 text-bg bg-ink font-medium hover:-translate-y-px transition-all ease-[cubic-bezier(.22,1,.36,1)] group disabled:opacity-50"
          >
            <span className="absolute inset-0 bg-gold -translate-x-full group-hover:translate-x-0 transition-transform duration-400 ease-[cubic-bezier(.22,1,.36,1)]" />
            <span className="relative z-1">
              {updateArtwork.isPending ? 'Guardando…' : 'Guardar cambios →'}
            </span>
          </button>
        </div>
      </div>
    </form>
  )
}
