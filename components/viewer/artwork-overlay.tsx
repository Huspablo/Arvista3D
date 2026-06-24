'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import type { SlotManifest, FlatAssets } from '@/types/manifest'
import { TYPE_LABEL } from '@/lib/labels'

interface Props {
  slot:    SlotManifest
  onClose: () => void
}

export function ArtworkOverlay({ slot, onClose }: Props) {
  const { artwork } = slot
  const closeRef    = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!artwork) return null

  const dims = artwork.dimensions
    ? `${artwork.dimensions.width} × ${artwork.dimensions.height}${artwork.dimensions.depth ? ` × ${artwork.dimensions.depth}` : ''} cm`
    : null

  // FlatAssets (pinturas/fotos) tiene `detail`; ModelAssets (esculturas) solo tiene `thumbnail`.
  // Usar || en lugar de ?? descarta strings vacíos de obras pendientes de pipeline.
  const isFlatAssets = 'detail' in artwork.assets
  const imageUrl = isFlatAssets
    ? ((artwork.assets as FlatAssets).detail || (artwork.assets as FlatAssets).thumbnail)
    : ((artwork.assets as { thumbnail: string }).thumbnail || null)

  return (
    <div
      className="overlay-slide-in absolute right-0 top-0 bottom-0 w-80 flex flex-col z-20 max-md:w-full max-md:top-auto max-md:h-[60vh]"
      style={{
        background:     'oklch(96% 0.007 75 / .97)',
        backdropFilter: 'blur(20px) saturate(140%)',
        borderLeft:     '1px solid oklch(70% 0.01 75 / .14)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-7 py-5 shrink-0"
        style={{ borderBottom: '1px solid oklch(70% 0.01 75 / .12)' }}
      >
        <span className="text-[9px] tracking-[5px] uppercase text-gold font-medium">
          {TYPE_LABEL[artwork.type] ?? artwork.type}
        </span>
        <button
          ref={closeRef}
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-xs text-ink3 hover:text-ink hover:bg-bg2 text-[12px] transition-colors"
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>

      {/* Artwork image preview */}
      {imageUrl ? (
        <div
          className="relative w-full shrink-0 overflow-hidden"
          style={{
            aspectRatio:  '4/3',
            borderBottom: '1px solid oklch(70% 0.01 75 / .12)',
            background:   'oklch(92% 0.005 75)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={artwork.title}
            className="w-full h-full object-contain"
          />
        </div>
      ) : (
        /* No-image placeholder for artworks pending pipeline processing */
        <div
          className="relative w-full shrink-0 flex flex-col items-center justify-center gap-2"
          style={{
            aspectRatio:  '4/3',
            borderBottom: '1px solid oklch(70% 0.01 75 / .12)',
            background:   'oklch(92% 0.005 75)',
          }}
        >
          <span className="text-[28px] opacity-20">🖼</span>
          <span className="text-[10px] tracking-[2px] uppercase text-ink3 opacity-60">
            Imagen en proceso
          </span>
        </div>
      )}

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-7 py-6 min-h-0">
        <h2 className="font-serif text-[22px] font-black leading-none mb-1.5">
          {artwork.title}
        </h2>
        <p className="text-[12px] text-ink2 mb-6 tracking-wide">
          {artwork.artistName}
          {artwork.year && <span className="text-ink3"> · {artwork.year}</span>}
        </p>

        <div className="space-y-5">
          {dims && (
            <div>
              <div className="text-[9px] tracking-[3px] uppercase text-ink3 mb-1.5">Dimensiones</div>
              <div className="text-[13px] font-medium text-ink">{dims}</div>
            </div>
          )}
          {artwork.tags.length > 0 && (
            <div>
              <div className="text-[9px] tracking-[3px] uppercase text-ink3 mb-2">Etiquetas</div>
              <div className="flex gap-1.5 flex-wrap">
                {artwork.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-[10px] px-2.5 py-0.5 text-ink3"
                    style={{
                      border:       '1px solid oklch(50% 0.01 75 / .18)',
                      borderRadius: '2px',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer CTA */}
      <div
        className="px-7 py-5 shrink-0"
        style={{ borderTop: '1px solid oklch(70% 0.01 75 / .12)' }}
      >
        <Link
          href={`/artworks/${artwork.id}`}
          className="relative flex items-center justify-center w-full py-2.5 bg-ink text-bg text-[12px] font-medium tracking-wide no-underline overflow-hidden group hover:-translate-y-px transition-all ease-[cubic-bezier(.22,1,.36,1)]"
        >
          <span className="absolute inset-0 bg-gold -translate-x-full group-hover:translate-x-0 transition-transform duration-400 ease-[cubic-bezier(.22,1,.36,1)]" />
          <span className="relative z-1">Ver detalle completo →</span>
        </Link>
      </div>
    </div>
  )
}
