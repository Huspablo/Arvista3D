'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useGalleries, useUpdateGallery, useDeleteGallery, type GalleryWithCount } from '@/lib/hooks/use-galleries'
import { useArtist } from '@/lib/hooks/use-artist'
import { PLAN_LIMITS } from '@/lib/services/artist.service'
import { useFocusTrap } from '@/lib/hooks/use-focus-trap'
import { GalleryPreview } from '@/components/dashboard/gallery-preview'

const BAR_COLOR  = { PUBLIC: 'var(--color-ok)', PRIVATE: 'var(--color-gold)' }
const PLAN_LABEL = { BASIC: 'Básico', STANDARD: 'Estándar', PREMIUM: 'Premium' } as const

export function GalleriesManager() {
  const { data: galleries = [], isLoading }  = useGalleries()
  const { data: artist }                     = useArtist()
  const updateGallery                        = useUpdateGallery()
  const deleteGallery                        = useDeleteGallery()

  const plan   = artist?.plan ?? 'BASIC'
  const limits = PLAN_LIMITS[plan]
  const slots  = limits.galleries - galleries.length

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [isDeleting,   setIsDeleting]   = useState(false)
  const deleteDialogRef                 = useRef<HTMLDivElement>(null)
  useFocusTrap(deleteDialogRef, !!deleteTarget)

  const toggleVisibility = (id: string, current: 'PUBLIC' | 'PRIVATE') => {
    updateGallery.mutate({ id, visibility: current === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC' })
  }

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    deleteGallery.mutate(deleteTarget.id, {
      onSuccess: () => { setDeleteTarget(null); setIsDeleting(false) },
      onError:   () => setIsDeleting(false),
    })
  }

  return (
    <>
      {/* ── Modal: confirmación de borrado ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 backdrop-blur-sm">
          <div ref={deleteDialogRef} role="dialog" aria-modal="true" aria-label="Eliminar galería" className="bg-bg border border-(--border) p-8 w-96 max-w-[calc(100vw-2rem)] shadow-2xl">
            <h3 className="font-serif text-[22px] font-bold mb-2">Eliminar galería</h3>
            <p className="text-[14px] text-ink2 mb-1">Vas a eliminar permanentemente:</p>
            <p className="font-medium text-[15px] mb-6 font-serif">"{deleteTarget.name}"</p>
            <div
              className="text-[13px] px-4 py-3 rounded-xs mb-7 flex items-start gap-2"
              style={{
                borderLeft: '3px solid oklch(62% 0.18 32 / 0.5)',
                background: 'oklch(62% 0.18 32 / 0.06)',
                color:      'var(--color-warn)',
              }}
            >
              <span className="shrink-0 mt-px">⚠</span>
              <span>Esta acción no se puede deshacer. Las obras expuestas en esta galería pasarán a estado borrador.</span>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="text-[13px] px-5 py-2.5 border border-(--border) rounded-xs text-ink3 hover:border-(--border-md) hover:text-ink transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="text-[13px] px-5 py-2.5 rounded-xs text-bg font-medium hover:-translate-y-px transition-all ease-[cubic-bezier(.22,1,.36,1)] disabled:opacity-50"
                style={{ background: 'var(--color-warn)' }}
              >
                {isDeleting ? 'Eliminando…' : 'Eliminar galería'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Banner de plan */}
      <div className="mb-8 p-5 border border-(--border) bg-bg2 reveal">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-6 flex-wrap">
            <div>
              <div className="text-[10px] tracking-[3px] uppercase text-ink3 mb-1.5">Plan actual</div>
              <div className="font-serif text-[20px] font-bold">{PLAN_LABEL[plan]}</div>
            </div>
            <div className="w-px h-10 bg-(--border) max-md:hidden" />
            <div>
              <div className="text-[10px] tracking-[3px] uppercase text-ink3 mb-1.5">Galerías</div>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-[28px] font-black leading-none">{galleries.length}</span>
                <span className="text-[14px] text-ink3">/ {limits.galleries} disponibles</span>
              </div>
            </div>
            <div>
              <div className="w-32 h-0.75 bg-(--border) rounded-sm overflow-hidden">
                <div
                  className="h-full rounded-sm bg-ok transition-all duration-1000"
                  style={{ width: `${Math.min((galleries.length / limits.galleries) * 100, 100)}%` }}
                />
              </div>
              <div className="text-[11px] text-ink3 mt-1">
                {slots} slot{slots !== 1 ? 's' : ''} libre{slots !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
          <Link
            href="/dashboard/plan"
            className="text-[12px] px-4 py-2 border border-(--border) rounded-xs text-ink3 no-underline hover:border-(--border-md) hover:text-ink transition-all shrink-0"
          >
            Ver plan →
          </Link>
        </div>
      </div>

      {/* Grid de galerías */}
      {isLoading ? (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
          {[1, 2].map(i => (
            <div key={i} className="h-80 bg-bg2 border border-(--border) animate-pulse rounded-xs" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 max-md:grid-cols-1" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
          {(galleries as GalleryWithCount[]).map((g, i) => (
            <div
              key={g.id}
              className={`bg-bg border border-(--border) overflow-hidden hover:border-(--border-md) hover:shadow-md hover:-translate-y-0.75 transition-all ease-[cubic-bezier(.22,1,.36,1)] reveal ${i > 0 ? `rd${i}` : ''}`}
            >
              {/* Preview */}
              <div className="relative h-45 overflow-hidden bg-bg2 group flex items-center justify-center">
                <GalleryPreview images={g.previewImages ?? []} wallColor={g.wallColor} gradientH="h-14" />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 z-10"
                  style={{ background: 'oklch(14% 0.010 75 / .45)' }}
                >
                  <Link
                    href={`/galleries/${g.slug}/viewer`}
                    className="text-[12px] px-4 py-2 bg-gold text-bg no-underline rounded-xs font-medium hover:bg-gold-hi transition-colors"
                  >
                    ◈ Ver 3D
                  </Link>
                  <Link
                    href={`/galleries/${g.slug}`}
                    className="text-[12px] px-4 py-2 bg-bg text-ink no-underline rounded-xs hover:bg-bg2 transition-colors"
                  >
                    {g.visibility === 'PUBLIC' ? 'Ver pública →' : 'Previsualizar →'}
                  </Link>
                </div>
              </div>

              {/* Body */}
              <div className="px-5 py-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-serif text-[19px] font-bold leading-tight">{g.name}</span>
                  <span className={`text-[9px] tracking-[1.5px] uppercase px-2.25 py-0.75 rounded-[1px] font-medium shrink-0 border mt-0.75 ${
                    g.visibility === 'PUBLIC'
                      ? 'bg-(--ok-dim) text-ok border-[oklch(56%_0.14_155/0.2)]'
                      : 'bg-(--border) text-ink3 border-(--border)'
                  }`}>
                    {g.visibility === 'PUBLIC' ? 'Pública' : 'Privada'}
                  </span>
                </div>

                <div className="flex items-center gap-4 mt-2 mb-3 text-[12px] text-ink3">
                  <span>{g.exposedCount} obra{g.exposedCount !== 1 ? 's' : ''} expuesta{g.exposedCount !== 1 ? 's' : ''}</span>
                  <span className="w-px h-3 bg-(--border)" />
                  <span>Act. {new Date(g.updatedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                </div>

                <div className="h-0.75 bg-(--border) rounded-sm overflow-hidden">
                  <div
                    className="h-full rounded-sm transition-all duration-700"
                    style={{
                      width:      `${Math.min((g.exposedCount / limits.artworksPerGallery) * 100, 100)}%`,
                      background: BAR_COLOR[g.visibility],
                    }}
                  />
                </div>
                <div className="text-[11px] text-ink3 mt-1.5">
                  {g.exposedCount} / {limits.artworksPerGallery} obras expuestas
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-1.5 px-5 pb-4 pt-3 border-t border-(--border)">
                <Link
                  href="/dashboard/artworks"
                  className="text-[12px] px-4 py-1.75 border border-(--border) rounded-xs text-ink3 no-underline hover:border-(--border-md) hover:text-ink transition-all"
                >
                  Gestionar obras
                </Link>
                <button
                  onClick={() => toggleVisibility(g.id, g.visibility)}
                  disabled={updateGallery.isPending}
                  className={`ml-auto text-[12px] px-4 py-1.75 border rounded-xs transition-all disabled:opacity-50 ${
                    g.visibility === 'PUBLIC'
                      ? 'border-(--border) text-ink3 hover:border-(--border-md) hover:text-ink'
                      : 'border-gold text-gold bg-(--gold-dim) hover:bg-[oklch(60%_0.130_82/0.18)]'
                  }`}
                >
                  {g.visibility === 'PUBLIC' ? 'Privatizar' : 'Publicar'}
                </button>
                <button
                  onClick={() => setDeleteTarget({ id: g.id, name: g.name })}
                  disabled={deleteGallery.isPending}
                  className="text-[12px] px-3 py-1.75 border border-(--border) rounded-xs text-ink3 hover:border-warn hover:text-warn transition-all disabled:opacity-50"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}

          {/* Slot de nueva galería */}
          {slots > 0 && (
            <Link
              href="/dashboard/galleries/new"
              className="border-2 border-dashed border-(--border) flex flex-col items-center justify-center gap-2 text-ink3 hover:border-gold hover:text-gold transition-colors min-h-80 no-underline reveal rd2"
            >
              <span className="text-[28px] opacity-30">+</span>
              <span className="text-[13px]">Nueva galería</span>
              <span className="text-[11px] opacity-60">{slots} slot{slots > 1 ? 's' : ''} disponible{slots > 1 ? 's' : ''}</span>
            </Link>
          )}
        </div>
      )}
    </>
  )
}
