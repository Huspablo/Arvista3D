'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import type { SlotManifest } from '@/types/manifest'

interface Props {
  slot:    SlotManifest
  onClose: () => void
}

const TYPE_LABEL: Record<string, string> = {
  PAINTING: 'Pintura', SCULPTURE: 'Escultura', PHOTOGRAPHY: 'Fotografía', OTHER: 'Otro',
}

export function ArtworkOverlay({ slot, onClose }: Props) {
  const { artwork } = slot

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!artwork) return null

  const dims = artwork.dimensions
    ? `${artwork.dimensions.width} × ${artwork.dimensions.height}${artwork.dimensions.depth ? ` × ${artwork.dimensions.depth}` : ''} cm`
    : null

  return (
    <div
      className="absolute right-0 top-0 bottom-0 w-80 flex flex-col z-20 max-md:w-full max-md:top-auto max-md:h-[60vh]"
      style={{ background: 'oklch(97.5% 0.007 75 / .96)', backdropFilter: 'blur(16px)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-7 py-5 border-b border-(--border)">
        <span className="text-[10px] tracking-[5px] uppercase text-gold">
          {TYPE_LABEL[artwork.type] ?? artwork.type}
        </span>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center text-ink3 hover:text-ink text-[13px] transition-colors"
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-7 py-6">
        <h2 className="font-serif text-[28px] font-black leading-[.95] mb-2">
          {artwork.title}
        </h2>
        <p className="text-[14px] text-ink2 mb-8">
          {artwork.artistName}
          {artwork.year && <span className="text-ink3"> · {artwork.year}</span>}
        </p>

        <div className="space-y-4">
          {dims && (
            <div>
              <div className="text-[10px] tracking-[3px] uppercase text-ink3 mb-1">Dimensiones</div>
              <div className="text-[14px] font-medium">{dims}</div>
            </div>
          )}
          {artwork.tags.length > 0 && (
            <div>
              <div className="text-[10px] tracking-[3px] uppercase text-ink3 mb-2">Etiquetas</div>
              <div className="flex gap-1.5 flex-wrap">
                {artwork.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-[11px] px-3 py-1 border border-(--border) text-ink3 rounded-[10px]"
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
      <div className="px-7 py-5 border-t border-(--border)">
        <Link
          href={`/artworks/${artwork.id}`}
          className="flex items-center justify-center w-full py-2.75 bg-ink text-bg text-[13px] font-medium no-underline rorounded-xselative overflow-hidden group hover:-translate-y-px transition-all ease-[cubic-bezier(.22,1,.36,1)]"
        >
          <span className="absolute inset-0 bg-gold -translate-x-full group-hover:translate-x-0 transition-transform duration-400 ease-[cubic-bezier(.22,1,.36,1)]" />
          <span className="relative z-1">Ver detalle completo →</span>
        </Link>
      </div>
    </div>
  )
}
