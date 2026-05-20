'use client'

import { useState, useCallback, useRef, DragEvent, ChangeEvent } from 'react'
import Link from 'next/link'

const TYPES = [
  { value: 'pintura',    label: 'Pintura'    },
  { value: 'escultura',  label: 'Escultura'  },
  { value: 'fotografia', label: 'Fotografía' },
  { value: 'otro',       label: 'Otro'       },
]

const GALLERIES = [
  { value: '',                 label: 'Sin asignar'                             },
  { value: 'texturas-urbanas', label: 'Texturas urbanas',   slots: 2            },
  { value: 'agua-y-forma',     label: 'Agua & Forma',        slots: 7            },
]

interface FormErrors {
  title?: string
  type?:  string
  year?:  string
}

export function NewArtworkForm() {
  // Upload state
  const fileInputRef                      = useRef<HTMLInputElement>(null)
  const [previews,       setPreviews]     = useState<string[]>([])
  const [activeIdx,      setActiveIdx]    = useState(0)
  const [isDragging,     setIsDragging]   = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading,      setUploading]    = useState(false)

  // Form state
  const [title,       setTitle]       = useState('')
  const [type,        setType]        = useState('')
  const [year,        setYear]        = useState(String(new Date().getFullYear()))
  const [dims,        setDims]        = useState('')
  const [technique,   setTechnique]   = useState('')
  const [edition,     setEdition]     = useState('')
  const [description, setDescription] = useState('')
  const [gallery,     setGallery]     = useState('')
  const [errors,      setErrors]      = useState<FormErrors>({})
  const [submitted,   setSubmitted]   = useState(false)

  const simulateUpload = useCallback((files: File[]) => {
    const urls = files.slice(0, 4).map(f => URL.createObjectURL(f))
    setPreviews(prev => [...prev, ...urls].slice(0, 4))
    setActiveIdx(0)
    setUploading(true)
    setUploadProgress(0)

    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - start) / 1400, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      setUploadProgress(ease * 100)
      if (t < 1) requestAnimationFrame(tick)
      else setUploading(false)
    }
    requestAnimationFrame(tick)
  }, [])

  const onDragOver  = useCallback((e: DragEvent) => { e.preventDefault(); setIsDragging(true) }, [])
  const onDragLeave = useCallback(() => setIsDragging(false), [])
  const onDrop      = useCallback((e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    if (files.length) simulateUpload(files)
  }, [simulateUpload])

  const onFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter(f => f.type.startsWith('image/'))
    if (files.length) simulateUpload(files)
    e.target.value = ''
  }, [simulateUpload])

  const validate = (): boolean => {
    const errs: FormErrors = {}
    if (!title.trim()) errs.title = 'El título es obligatorio'
    if (!type)         errs.type  = 'Selecciona un tipo'
    if (!year || isNaN(Number(year)) || Number(year) < 1900)
      errs.year = 'Año inválido'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (asDraft: boolean) => {
    if (!asDraft && !validate()) return
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-24 gap-6 px-6 text-center">
        <span className="text-[40px] opacity-20 font-serif">◇</span>
        <h2 className="font-serif text-[32px] font-black">
          Obra {gallery ? 'creada y expuesta' : 'guardada'}
        </h2>
        <p className="text-[15px] text-ink3 max-w-95">
          {gallery
            ? `La obra "${title || 'Sin título'}" ha sido añadida a la galería.`
            : `La obra "${title || 'Sin título'}" ha sido guardada como borrador.`}
        </p>
        <div className="flex gap-3 mt-2">
          <Link
            href="/dashboard/artworks"
            className="text-[13px] px-6 py-2.5 border border-(--border) rounded-xs text-ink3 no-underline hover:border-(--border-md) hover:text-ink transition-all"
          >
            Ver todas las obras
          </Link>
          <button
            onClick={() => {
              setSubmitted(false)
              setPreviews([])
              setTitle('')
              setType('')
              setDims('')
              setTechnique('')
              setEdition('')
              setDescription('')
              setGallery('')
              setErrors({})
            }}
            className="text-[13px] px-6 py-2.5 bg-ink text-bg rounded-xs hover:-translate-y-px transition-all ease-[cubic-bezier(.22,1,.36,1)]"
          >
            + Crear otra obra
          </button>
        </div>
      </div>
    )
  }

  const selectedGallery = GALLERIES.find(g => g.value === gallery && g.value !== '')

  return (
    <>
      {/* Hidden file input shared across all upload triggers */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onFileChange}
      />

      <div
        className="flex-1 max-md:block"
        style={{ display: 'grid', gridTemplateColumns: '1fr 420px' }}
      >
        {/* ── Left: upload zone / image preview ── */}
        <div className="bg-bg2 border-r border-(--border) flex flex-col min-h-150">
          {previews.length === 0 ? (
            /* Empty drop zone */
            <div
              className={`flex-1 m-8 flex flex-col items-center justify-center border-2 border-dashed rounded-xs transition-all cursor-pointer select-none ${
                isDragging
                  ? 'border-gold bg-(--gold-dim)'
                  : 'border-(--border-md) hover:border-gold hover:bg-(--gold-dim)'
              }`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div
                className={`text-[48px] mb-5 transition-all duration-300 ${
                  isDragging ? 'opacity-80 scale-110 text-gold' : 'opacity-20 text-ink'
                }`}
              >
                ↑
              </div>
              <p
                className={`font-serif text-[22px] font-bold mb-2 transition-colors ${
                  isDragging ? 'text-gold' : 'text-ink2'
                }`}
              >
                Arrastra tus imágenes aquí
              </p>
              <p className="text-[14px] text-ink3 mb-2">o haz clic para seleccionar</p>
              <p className="text-[12px] text-ink3 opacity-50">
                JPG · PNG · WebP &nbsp;·&nbsp; máx. 20 MB &nbsp;·&nbsp; hasta 4 imágenes
              </p>
            </div>
          ) : (
            /* Preview + thumbnail strip */
            <>
              <div className="flex-1 relative overflow-hidden min-h-100 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previews[activeIdx]}
                  alt="Vista previa"
                  className="w-full h-full absolute inset-0 object-cover transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.02]"
                />
                {/* Upload progress overlay */}
                {uploading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4"
                    style={{ background: 'oklch(97.5% 0.007 75 / 0.75)' }}
                  >
                    <span className="text-[13px] text-ink3 tracking-[2px] uppercase">Procesando…</span>
                    <div className="w-50 h-0.75 bg-(--border) rounded-sm overflow-hidden">
                      <div
                        className="h-full bg-gold rounded-sm"
                        style={{ width: `${uploadProgress}%`, transition: 'width 0.1s linear' }}
                      />
                    </div>
                    <span className="text-[12px] text-ink3">{Math.round(uploadProgress)}%</span>
                  </div>
                )}
                {/* Remove button */}
                <button
                  onClick={() => { setPreviews([]); setActiveIdx(0) }}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-bg border border-(--border) text-ink3 hover:text-ink hover:border-(--border-md) transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center text-[12px]"
                  title="Eliminar imágenes"
                >
                  ✕
                </button>
              </div>

              {/* Thumbnail strip */}
              <div className="flex gap-2 px-5 py-4 border-t border-(--border) bg-bg">
                {previews.map((src, i) => (
                  <button
                    key={src}
                    onClick={() => setActiveIdx(i)}
                    className={`w-18 h-13.5 shrink-0 overflow-hidden border-2 transition-all ${
                      i === activeIdx ? 'border-gold' : 'border-transparent hover:scale-[1.04]'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
                {previews.length < 4 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-18 h-13.5 shrink-0 border-2 border-dashed border-(--border) text-ink3 text-[22px] hover:border-gold hover:text-gold transition-colors flex items-center justify-center"
                    title="Añadir más imágenes"
                  >
                    +
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Right: metadata form ── */}
        <div
          className="overflow-y-auto px-10 py-10 max-md:px-6 max-md:py-8 max-md:static max-md:h-auto"
          style={{ position: 'sticky', top: '57px', height: 'calc(100vh - 57px)' }}
        >
          <p className="text-[11px] tracking-[5px] uppercase text-gold mb-6">Información</p>

          {/* Title */}
          <div className="mb-5">
            <label className="text-[11px] tracking-[3px] uppercase text-ink3 mb-2 block">
              Título <span className="text-warn">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => { setTitle(e.target.value); setErrors(p => ({ ...p, title: undefined })) }}
              placeholder="Ej. Espiral #3"
              className={`w-full px-4 py-3 border rounded-xs bg-bg3 text-[15px] text-ink placeholder:text-ink3 outline-none transition-colors focus:border-(--border-md) ${
                errors.title ? 'border-warn' : 'border-(--border)'
              }`}
            />
            {errors.title && (
              <p className="text-[12px] mt-1" style={{ color: 'var(--color-warn)' }}>
                {errors.title}
              </p>
            )}
          </div>

          {/* Type */}
          <div className="mb-5">
            <label className="text-[11px] tracking-[3px] uppercase text-ink3 mb-2 block">
              Tipo <span className="text-warn">*</span>
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => { setType(t.value); setErrors(p => ({ ...p, type: undefined })) }}
                  className={`text-[12px] px-4 py-2 border rounded-xs transition-all ${
                    type === t.value
                      ? 'border-ink bg-ink text-bg'
                      : 'border-(--border) text-ink3 hover:border-(--border-md) hover:text-ink'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {errors.type && (
              <p className="text-[12px] mt-2" style={{ color: 'var(--color-warn)' }}>
                {errors.type}
              </p>
            )}
          </div>

          {/* Year + Dimensions */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="text-[11px] tracking-[3px] uppercase text-ink3 mb-2 block">
                Año <span className="text-warn">*</span>
              </label>
              <input
                type="number"
                value={year}
                onChange={e => { setYear(e.target.value); setErrors(p => ({ ...p, year: undefined })) }}
                min="1900"
                max={new Date().getFullYear()}
                className={`w-full px-4 py-3 border rounded-xs bg-bg3 text-[15px] text-ink outline-none transition-colors focus:border-(--border-md) ${
                  errors.year ? 'border-warn' : 'border-(--border)'
                }`}
              />
              {errors.year && (
                <p className="text-[12px] mt-1" style={{ color: 'var(--color-warn)' }}>
                  {errors.year}
                </p>
              )}
            </div>
            <div>
              <label className="text-[11px] tracking-[3px] uppercase text-ink3 mb-2 block">
                Dimensiones
              </label>
              <input
                type="text"
                value={dims}
                onChange={e => setDims(e.target.value)}
                placeholder="80 × 100 cm"
                className="w-full px-4 py-3 border border-(--border) rounded-xs bg-bg3 text-[15px] text-ink placeholder:text-ink3 outline-none transition-colors focus:border-(--border-md)"
              />
            </div>
          </div>

          {/* Technique + Edition */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="text-[11px] tracking-[3px] uppercase text-ink3 mb-2 block">
                Técnica
              </label>
              <input
                type="text"
                value={technique}
                onChange={e => setTechnique(e.target.value)}
                placeholder="Óleo sobre lino"
                className="w-full px-4 py-3 border border-(--border) rounded-xs bg-bg3 text-[15px] text-ink placeholder:text-ink3 outline-none transition-colors focus:border-(--border-md)"
              />
            </div>
            <div>
              <label className="text-[11px] tracking-[3px] uppercase text-ink3 mb-2 block">
                Edición
              </label>
              <input
                type="text"
                value={edition}
                onChange={e => setEdition(e.target.value)}
                placeholder="1 / 3"
                className="w-full px-4 py-3 border border-(--border) rounded-xs bg-bg3 text-[15px] text-ink placeholder:text-ink3 outline-none transition-colors focus:border-(--border-md)"
              />
            </div>
          </div>

          {/* Description */}
          <div className="mb-5">
            <label className="text-[11px] tracking-[3px] uppercase text-ink3 mb-2 block">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe la obra, su concepto, proceso creativo…"
              rows={4}
              className="w-full px-4 py-3 border border-(--border) rounded-xs bg-bg3 text-[15px] text-ink placeholder:text-ink3 outline-none transition-colors focus:border-(--border-md) resize-none leading-[1.7]"
            />
          </div>

          {/* Gallery assignment */}
          <div className="mb-8">
            <label className="text-[11px] tracking-[3px] uppercase text-ink3 mb-2 block">
              Asignar a galería
            </label>
            <div className="relative">
              <select
                value={gallery}
                onChange={e => setGallery(e.target.value)}
                className="w-full px-4 py-3 border border-(--border) rounded-xs bg-bg3 text-[15px] text-ink outline-none transition-colors focus:border-(--border-md) appearance-none cursor-pointer pr-10"
              >
                {GALLERIES.map(g => (
                  <option key={g.value} value={g.value}>
                    {g.value === ''
                      ? g.label
                      : `${g.label} (${g.slots} slot${g.slots !== 1 ? 's' : ''} libre${g.slots !== 1 ? 's' : ''})`}
                  </option>
                ))}
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-ink3 pointer-events-none text-[12px]">
                ▾
              </span>
            </div>
            {selectedGallery && (
              <p className="text-[12px] text-ink3 mt-2">
                La obra quedará expuesta en{' '}
                <span className="text-ink font-medium">{selectedGallery.label}</span>{' '}
                al crearla.
              </p>
            )}
            {!gallery && (
              <p className="text-[12px] text-ink3 mt-2 opacity-60">
                Puedes asignarla a una galería más adelante desde la lista de obras.
              </p>
            )}
          </div>

          {/* Plan limit warning */}
          <div
            className="flex items-start gap-3 px-4 py-3 border rounded-xs mb-8 text-[13px]"
            style={{
              borderColor: 'oklch(62% 0.18 32 / 0.3)',
              background:  'var(--warn-dim)',
              color:       'var(--color-warn)',
            }}
          >
            <span className="shrink-0 mt-px">⚠</span>
            <span>
              Tienes <strong>10/10 obras expuestas</strong>. Para exponer esta obra deberás retirar otra
              o ampliar tu plan.
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-(--border)">
            <Link
              href="/dashboard/artworks"
              className="text-[13px] px-4 py-2.5 border border-(--border) rounded-xs text-ink3 no-underline hover:border-(--border-md) hover:text-ink transition-all"
            >
              Cancelar
            </Link>
            <button
              onClick={() => handleSubmit(true)}
              className="text-[13px] px-4 py-2.5 border border-(--border) rounded-xs text-ink hover:border-(--border-md) transition-all"
            >
              Guardar borrador
            </button>
            <button
              onClick={() => handleSubmit(false)}
              className="ml-auto relative overflow-hidden text-[13px] px-6 py-2.5 rounded-xs text-bg bg-ink font-medium hover:-translate-y-px transition-all ease-[cubic-bezier(.22,1,.36,1)] group"
            >
              <span className="absolute inset-0 bg-gold -translate-x-full group-hover:translate-x-0 transition-transform duration-400 ease-[cubic-bezier(.22,1,.36,1)]" />
              <span className="relative z-1">Crear obra →</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
