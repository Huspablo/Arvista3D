'use client'

import { useRef } from 'react'
import Link from 'next/link'
import type { ArtworkWithGallery } from '@/lib/hooks/use-artworks'
import type { Gallery } from '@prisma/client'
import { TYPE_LABEL } from '@/lib/labels'

// ── Iconos SVG inline ─────────────────────────────────────────────────────────

export function IconEdit() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8.5 1.5 10.5 3.5 4 10H2V8L8.5 1.5z" />
    </svg>
  )
}

export function IconEye() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 7s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z" />
      <circle cx="7" cy="7" r="1.5" />
    </svg>
  )
}

export function IconTrash() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1.5 3h9M4.5 3V2h3v1M10 3 9.5 10a.5.5 0 0 1-.5.5h-4a.5.5 0 0 1-.5-.5L4 3" />
      <path d="M5 5.5v3M7 5.5v3" />
    </svg>
  )
}

// ── Tarjeta de obra individual ────────────────────────────────────────────────

export interface ArtworkCardProps {
  artwork:         ArtworkWithGallery
  galleries:       Pick<Gallery, 'id' | 'name' | 'visibility'>[]
  publishingId:    string | null
  canPublish:      boolean
  onPublish:       (id: string) => void
  onUnpublish:     (id: string) => void
  onDeleteRequest: (id: string, title: string) => void
}

export function ArtworkCard({
  artwork: a,
  publishingId,
  canPublish,
  onPublish,
  onUnpublish,
  onDeleteRequest,
}: ArtworkCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current
    if (!el) return
    const { left, top, width, height } = el.getBoundingClientRect()
    const x = ((e.clientX - left) / width  - 0.5) * 2
    const y = ((e.clientY - top)  / height - 0.5) * 2
    el.style.setProperty('--rx', `${(-y * 5).toFixed(1)}deg`)
    el.style.setProperty('--ry', `${ (x * 5).toFixed(1)}deg`)
    el.style.setProperty('--mx', `${((e.clientX - left) / width  * 100).toFixed(0)}%`)
    el.style.setProperty('--my', `${((e.clientY - top)  / height * 100).toFixed(0)}%`)
    el.style.transition = 'transform 0.05s linear'
  }

  const onMouseEnter = () => {
    const el = cardRef.current
    if (!el) return
    el.style.transition = 'transform 0.05s linear, box-shadow 0.2s ease'
    el.style.boxShadow = 'var(--shadow-md)'
  }

  const onMouseLeave = () => {
    const el = cardRef.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
    el.style.transition = 'transform 0.6s cubic-bezier(.22,1,.36,1), box-shadow 0.4s ease'
    el.style.boxShadow = 'var(--shadow-sm)'
  }

  return (
    <div className="group/card">
      <div
        ref={cardRef}
        onMouseMove={onMouseMove}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{
          transform:  'perspective(800px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))',
          boxShadow:  'var(--shadow-sm)',
          willChange: 'transform',
        }}
        className="bg-bg flex flex-col border border-(--border) h-full"
      >
        {/* ── Zona de imagen ── */}
        <div className="relative aspect-4/3 overflow-hidden bg-bg2">
          {a.assetThumbnail ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={a.assetThumbnail}
                alt={a.title}
                className="w-full h-full object-cover transition-transform duration-600 group-hover/card:scale-[1.04]"
              />
              {/* Overlay de acciones rápidas */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-ink/0 group-hover/card:bg-ink/50 opacity-0 group-hover/card:opacity-100 transition-all duration-300">
                <Link
                  href={`/dashboard/artworks/${a.id}/edit`}
                  className="flex items-center gap-1.5 text-[12px] px-3 py-2 bg-bg/90 backdrop-blur-xs text-ink rounded-xs no-underline hover:bg-bg transition-colors font-medium"
                >
                  <IconEdit /> Editar
                </Link>
                {a.status === 'EXPOSED' && (
                  <Link
                    href={`/artworks/${a.id}`}
                    className="flex items-center gap-1.5 text-[12px] px-3 py-2 bg-bg/90 backdrop-blur-xs text-ink rounded-xs no-underline hover:bg-bg transition-colors font-medium"
                  >
                    <IconEye /> Ver obra
                  </Link>
                )}
              </div>
              {/* Destello de luz — sigue al cursor para el efecto 3D */}
              <div
                className="absolute inset-0 pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity duration-200"
                style={{ background: 'radial-gradient(circle at var(--mx, 50%) var(--my, 50%), oklch(100% 0 0 / 0.12) 0%, transparent 55%)' }}
              />
            </>
          ) : a.assetOriginalKey ? (
            /* Imagen subida — generando variantes */
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8">
              <div className="w-full h-0.5 bg-bg3 rounded-full relative overflow-hidden">
                <div className="absolute inset-y-0 left-0 w-2/5 bg-linear-to-r from-transparent via-gold to-transparent animate-[artwork-progress_1.8s_ease-in-out_infinite]" />
              </div>
              <span className="text-[11px] text-ink3 tracking-wide">Generando vista previa…</span>
            </div>
          ) : (
            /* Sin imagen — zona accionable hacia el editor */
            <Link
              href={`/dashboard/artworks/${a.id}/edit`}
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 group/upload no-underline"
            >
              <div className="absolute inset-3 border border-dashed border-(--border-md) rounded-xs group-hover/upload:border-gold transition-colors" />
              <span className="relative text-[22px] text-ink3 opacity-20 group-hover/upload:opacity-60 transition-opacity">↑</span>
              <span className="relative text-[11px] text-ink3 opacity-60 group-hover/upload:text-gold group-hover/upload:opacity-100 transition-all">
                Añadir imagen →
              </span>
            </Link>
          )}
          {/* Badge de estado + galería */}
          <div className="absolute top-3 left-3 flex flex-col items-start gap-1">
            <span className={`text-[9px] tracking-[1.5px] uppercase px-2 py-0.75 rounded-xs font-medium border backdrop-blur-xs ${
              a.status === 'EXPOSED'
                ? 'bg-(--ok-dim) text-ok border-[oklch(56%_0.14_155/0.2)]'
                : 'bg-bg/80 text-ink3 border-(--border-md)'
            }`}>
              {a.status === 'EXPOSED' ? 'Expuesta' : 'Borrador'}
            </span>
            {a.status === 'EXPOSED' && a.slot?.gallery?.name && (
              <span className="text-[9px] tracking-[0.8px] text-gold px-1.5 py-0.5 bg-bg/85 backdrop-blur-xs rounded-xs border border-[oklch(60%_0.130_82/0.25)]">
                ◇ {a.slot.gallery.name}
              </span>
            )}
          </div>
        </div>

        {/* ── Metadatos ── */}
        <div className="px-5 pt-4 pb-2 flex-1">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <span className="font-serif text-[17px] font-bold leading-tight">{a.title}</span>
            {a.year && <span className="text-[11px] text-ink3 shrink-0 mt-0.75">{a.year}</span>}
          </div>
          <span className="text-[11px] tracking-[1.5px] uppercase text-ink3">{TYPE_LABEL[a.type]}</span>
        </div>

        {/* ── Barra de acciones ── */}
        <div className="flex items-center gap-1.5 px-5 py-3 border-t border-(--border)">
          <Link
            href={`/dashboard/artworks/${a.id}/edit`}
            className="text-[12px] px-4 py-1.75 border border-(--border) rounded-xs text-ink3 no-underline hover:border-(--border-md) hover:text-ink transition-all"
          >
            Editar
          </Link>
          {a.status === 'EXPOSED' ? (
            <button
              onClick={() => onUnpublish(a.id)}
              disabled={publishingId === a.id}
              className={`text-[12px] px-4 py-1.75 border border-(--border) rounded-xs text-ink3 hover:border-(--border-md) hover:text-ink transition-all disabled:opacity-60${publishingId === a.id ? ' cursor-wait' : ''}`}
            >
              {publishingId === a.id ? 'Retirando…' : 'Retirar'}
            </button>
          ) : (
            <button
              onClick={() => onPublish(a.id)}
              disabled={publishingId === a.id || !canPublish}
              className={`text-[12px] px-4 py-1.75 border border-gold rounded-xs text-gold bg-(--gold-dim) hover:bg-[oklch(60%_0.130_82/0.18)] transition-all disabled:opacity-60${publishingId === a.id ? ' cursor-wait' : ''}`}
            >
              {publishingId === a.id ? 'Publicando…' : 'Exponer'}
            </button>
          )}
          {/* Acciones secundarias — extremo derecho */}
          <div className="ml-auto flex items-center gap-1.5">
            {a.status === 'EXPOSED' && (
              <Link
                href={`/artworks/${a.id}`}
                className="text-[12px] px-3 py-1.75 border border-(--border) rounded-xs text-ink3 no-underline hover:border-(--border-md) hover:text-ink transition-all"
              >
                Ver →
              </Link>
            )}
            <div className="w-px h-4 bg-(--border)" />
            <button
              onClick={() => onDeleteRequest(a.id, a.title)}
              title="Eliminar obra"
              className="w-7.5 h-7.5 flex items-center justify-center border border-(--border) rounded-xs text-ink3 hover:border-warn hover:text-warn transition-all"
            >
              <IconTrash />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
