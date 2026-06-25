'use client'

import { useState, useCallback, useRef, DragEvent, ChangeEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { useCreateArtwork, usePublishArtwork, ARTWORKS_KEY, type ArtworkWithGallery } from '@/lib/hooks/use-artworks'
import { useArtist } from '@/lib/hooks/use-artist'
import { useGalleries } from '@/lib/hooks/use-galleries'
import { PLAN_LIMITS } from '@/lib/services/artist.service'
import type { ArtworkType } from '@prisma/client'

const TYPES: { value: ArtworkType; label: string; symbol: string }[] = [
  { value: 'PAINTING',    label: 'Pintura',    symbol: '▭' },
  { value: 'SCULPTURE',   label: 'Escultura',  symbol: '◇' },
  { value: 'PHOTOGRAPHY', label: 'Fotografía', symbol: '◎' },
  { value: 'OTHER',       label: 'Otro',       symbol: '∷' },
]

interface FormErrors { title?: string; type?: string; year?: string }

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

export function NewArtworkForm() {
  const router          = useRouter()
  const qc              = useQueryClient()
  const createArtwork   = useCreateArtwork()
  const publishArtwork  = usePublishArtwork()
  const { data: artist }          = useArtist()
  const { data: galleries = [] }  = useGalleries()

  const plan         = artist?.plan ?? 'BASIC'
  const limits       = PLAN_LIMITS[plan]
  const hasGalleries = galleries.length > 0

  const fileInputRef                = useRef<HTMLInputElement>(null)
  const [file,      setFile]        = useState<File | null>(null)
  const [preview,   setPreview]     = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading]   = useState(false)

  const [title,       setTitle]       = useState('')
  const [type,        setType]        = useState<ArtworkType | ''>('')
  const [year,        setYear]        = useState(String(new Date().getFullYear()))
  const [dims,        setDims]        = useState('')
  const [technique,   setTechnique]   = useState('')
  const [edition,     setEdition]     = useState('')
  const [description, setDescription] = useState('')
  const [gallery,     setGallery]     = useState('')
  const [errors,      setErrors]      = useState<FormErrors>({})
  const [apiError,    setApiError]    = useState('')

  const setImage = useCallback((incoming: File[]) => {
    const valid = incoming.find(f => f.type.startsWith('image/'))
    if (!valid) return
    setFile(valid)
    setPreview(URL.createObjectURL(valid))
  }, [])

  const onDragOver  = useCallback((e: DragEvent) => { e.preventDefault(); setIsDragging(true) }, [])
  const onDragLeave = useCallback(() => setIsDragging(false), [])
  const onDrop      = useCallback((e: DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    setImage(Array.from(e.dataTransfer.files))
  }, [setImage])
  const onFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setImage(Array.from(e.target.files ?? []))
    e.target.value = ''
  }, [setImage])

  const validate = (): boolean => {
    const errs: FormErrors = {}
    if (!title.trim()) errs.title = 'El título es obligatorio'
    if (!type)         errs.type  = 'Selecciona un tipo'
    if (!year || isNaN(Number(year)) || Number(year) < 1000) errs.year = 'Año inválido'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (asDraft: boolean) => {
    if (!validate()) return
    setApiError('')

    const dimMatch = dims.replace(/×/g, 'x').split('x').map(s => parseFloat(s.trim()))
    const [dimWidth, dimHeight, dimDepth] = dimMatch.length >= 2 ? dimMatch : [undefined, undefined, undefined]

    try {
      const artwork = await new Promise<{ id: string }>((resolve, reject) => {
        createArtwork.mutate(
          {
            title: title.trim(), type: type as ArtworkType,
            description: description.trim() || undefined,
            year: Number(year),
            technique: technique.trim() || undefined,
            edition:   edition.trim()   || undefined,
            dimWidth:  dimWidth  && !isNaN(dimWidth)  ? dimWidth  : undefined,
            dimHeight: dimHeight && !isNaN(dimHeight) ? dimHeight : undefined,
            dimDepth:  dimDepth  && !isNaN(dimDepth)  ? dimDepth  : undefined,
          },
          { onSuccess: resolve, onError: reject },
        )
      })

      const primaryFile = file
      if (primaryFile) {
        setUploading(true)
        try {
          const fd = new FormData()
          fd.append('file',      primaryFile)
          fd.append('artworkId', artwork.id)
          const uploadRes = await fetch('/api/assets/artwork-upload', { method: 'POST', body: fd })
          if (uploadRes.ok) {
            const { key: originalKey, thumbnailUrl } =
              await uploadRes.json() as { key: string; thumbnailUrl: string; ok: boolean }
            await qc.cancelQueries({ queryKey: ARTWORKS_KEY })
            qc.setQueryData<ArtworkWithGallery[]>(ARTWORKS_KEY, prev =>
              prev?.map(a => a.id === artwork.id ? { ...a, assetOriginalKey: originalKey, assetThumbnail: thumbnailUrl } : a)
            )
          } else {
            const errBody = await uploadRes.json().catch(() => ({})) as { error?: string }
            setApiError(errBody.error ?? 'Error al subir la imagen. Puedes añadirla desde Editar.')
          }
        } catch {
          setApiError('Error de conexión al subir la imagen. Puedes añadirla desde Editar.')
        }
        setUploading(false)
      }

      if (!asDraft && gallery && !isAtCapacity) {
        await new Promise<void>(resolve => {
          publishArtwork.mutate({ id: artwork.id, galleryId: gallery }, { onSuccess: () => resolve(), onError: () => resolve() })
        })
      }

      router.push('/dashboard/artworks')
    } catch (err) {
      setUploading(false)
      setApiError(err instanceof Error ? err.message : 'Error desconocido')
    }
  }

  const selectedGallery = galleries.find(g => g.id === gallery)
  const isAtCapacity    = selectedGallery
    ? selectedGallery.exposedCount >= limits.artworksPerGallery
    : false
  const isPending       = createArtwork.isPending || uploading

  return (
    <>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />

      <div className="px-12 py-10 flex gap-14 max-md:flex-col max-md:px-6 max-md:py-8">

        {/* ── Panel izquierdo: zona de imagen ── */}
        <aside className="w-65 shrink-0 flex flex-col gap-4 self-start md:sticky md:top-14.25 max-md:w-full">

          {!preview ? (
            /* Drop zone */
            <div
              className={`relative aspect-square border flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-200 group ${
                isDragging
                  ? 'border-gold bg-(--gold-dim)'
                  : 'border-(--border) bg-bg2 hover:border-(--border-md)'
              }`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {/* Marcas de esquina */}
              <span className={`absolute top-3 left-3 w-3.5 h-3.5 border-t border-l transition-colors ${isDragging ? 'border-gold' : 'border-(--border-md)'}`} />
              <span className={`absolute top-3 right-3 w-3.5 h-3.5 border-t border-r transition-colors ${isDragging ? 'border-gold' : 'border-(--border-md)'}`} />
              <span className={`absolute bottom-3 left-3 w-3.5 h-3.5 border-b border-l transition-colors ${isDragging ? 'border-gold' : 'border-(--border-md)'}`} />
              <span className={`absolute bottom-3 right-3 w-3.5 h-3.5 border-b border-r transition-colors ${isDragging ? 'border-gold' : 'border-(--border-md)'}`} />

              <span className={`font-serif text-[40px] leading-none mb-3 transition-all duration-200 ${
                isDragging ? 'text-gold opacity-80 scale-110' : 'text-ink opacity-8'
              }`}>◇</span>
              <p className={`text-[13px] font-medium mb-1 transition-colors ${isDragging ? 'text-gold' : 'text-ink3'}`}>
                Arrastra la imagen
              </p>
              <p className="text-[11px] text-ink3 opacity-50">o haz clic para seleccionar</p>
            </div>
          ) : (
            /* Previsualización */
            <div className="relative aspect-square bg-bg2 border border-(--border) overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Previsualización"
                className="absolute inset-0 w-full h-full object-contain p-3"
              />
              <button
                type="button"
                onClick={() => { setPreview(null); setFile(null) }}
                className="absolute top-2.5 right-2.5 w-7 h-7 flex items-center justify-center border border-(--border) bg-bg/90 backdrop-blur-xs text-ink3 hover:text-ink text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
              {uploading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                  style={{ background: 'oklch(97.5% 0.007 75 / 0.88)' }}>
                  <div className="w-8 h-px bg-gold animate-pulse" />
                  <span className="text-[9px] tracking-[3px] uppercase text-ink3">Subiendo…</span>
                </div>
              )}
            </div>
          )}

          {/* Controles de imagen */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[11px] px-3.5 py-1.75 border border-(--border) text-ink3 hover:border-(--border-md) hover:text-ink transition-all shrink-0"
            >
              {preview ? 'Cambiar imagen' : '+ Seleccionar'}
            </button>
            <span className="text-[9px] tracking-[1px] uppercase text-ink3 opacity-30 leading-normal">
              JPG · PNG<br />WebP · 20 MB
            </span>
          </div>
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
                  onClick={() => { setType(t.value); setErrors(p => ({ ...p, type: undefined })) }}
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
            {errors.type && <p className="text-[11px] mt-2 text-warn">{errors.type}</p>}
          </div>

          {/* Detalles físicos */}
          <div className="mb-7">
            <p className="text-[9px] tracking-[2.5px] uppercase text-ink3 mb-4">Detalles físicos</p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-5">
              <Field label="Año *" error={errors.year}>
                <input
                  type="number"
                  value={year}
                  onChange={e => { setYear(e.target.value); setErrors(p => ({ ...p, year: undefined })) }}
                  min="1000"
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
              placeholder="Concepto, proceso creativo, contexto de la obra…"
              rows={4}
              className={`${inputCls} resize-none leading-relaxed`}
            />
          </div>

          {/* Publicación */}
          <div className="mb-7">
            <p className="text-[9px] tracking-[2.5px] uppercase text-ink3 mb-3">Publicación</p>
            {hasGalleries ? (
              <>
                <div className="relative">
                  <select
                    value={gallery}
                    onChange={e => setGallery(e.target.value)}
                    className="w-full appearance-none cursor-pointer border border-(--border) bg-bg text-ink text-[14px] px-3 pr-8 py-2.5 rounded-xs outline-none focus:border-(--border-md) transition-colors"
                  >
                    <option value="">Sin asignar — guardar como borrador</option>
                    {galleries.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink3 pointer-events-none text-[11px]">▾</span>
                </div>
                {selectedGallery && !isAtCapacity && (
                  <p className="text-[11px] text-ink3 mt-2 opacity-60">
                    Se expondrá en <span className="text-ink font-medium">{selectedGallery.name}</span> al crear.
                  </p>
                )}
              </>
            ) : (
              <p className="text-[13px] text-ink3">
                <Link href="/dashboard/galleries/new" className="text-gold border-b border-gold/30 hover:border-gold transition-colors">
                  Crea tu primera galería
                </Link>{' '}
                para exponer obras.
              </p>
            )}
          </div>

          {/* Aviso de capacidad */}
          {hasGalleries && isAtCapacity && (
            <div
              className="flex items-start gap-3 px-4 py-3 border-l-2 mb-6 text-[12px]"
              style={{ borderLeftColor: 'oklch(62% 0.18 32 / 0.6)', background: 'oklch(62% 0.18 32 / 0.05)', color: 'var(--color-warn)' }}
            >
              <span className="shrink-0">⚠</span>
              <span>
                <strong>{selectedGallery!.exposedCount}/{limits.artworksPerGallery} obras en {selectedGallery!.name}</strong> — límite del plan.{' '}
                <Link href="/dashboard/plan" className="underline hover:no-underline">Ampliar</Link>.
              </span>
            </div>
          )}

          {apiError && (
            <p className="mb-6 text-[12px] text-warn border-l-2 pl-4 py-2"
              style={{ borderLeftColor: 'oklch(62% 0.18 32 / 0.5)', background: 'oklch(62% 0.18 32 / 0.04)' }}>
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
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={isPending}
              className="text-[12px] px-4 py-2.5 border border-(--border) text-ink hover:border-(--border-md) transition-all disabled:opacity-50"
            >
              Guardar borrador
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={isPending}
              className="ml-auto relative overflow-hidden text-[12px] px-7 py-2.5 text-bg bg-ink font-medium hover:-translate-y-px transition-all ease-[cubic-bezier(.22,1,.36,1)] group disabled:opacity-50"
            >
              <span className="absolute inset-0 bg-gold -translate-x-full group-hover:translate-x-0 transition-transform duration-400 ease-[cubic-bezier(.22,1,.36,1)]" />
              <span className="relative z-1">
                {isPending ? 'Guardando…' : 'Crear obra →'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
