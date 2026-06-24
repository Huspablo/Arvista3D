'use client'

import Link from 'next/link'
import { useGalleries, type GalleryWithCount } from '@/lib/hooks/use-galleries'
import { useArtist } from '@/lib/hooks/use-artist'
import { PLAN_LIMITS } from '@/lib/services/artist.service'
import { GalleryPreview } from '@/components/dashboard/gallery-preview'

const BAR_COLOR = { PUBLIC: 'var(--color-ok)', PRIVATE: 'var(--color-gold)' }

// ─────────────────────────────────────────────────────────────────────────────

export function GalleriesGrid() {
  const { data: galleries = [], isLoading } = useGalleries()
  const { data: artist }                    = useArtist()
  const plan   = artist?.plan ?? 'BASIC'
  const limits = PLAN_LIMITS[plan]
  const slots  = limits.galleries - galleries.length

  return (
    <div>
      <div className="flex items-center justify-between mb-5 reveal">
        <span className="font-serif text-[22px] font-bold">Mis galerías</span>
        <Link href="/dashboard/galleries" className="text-[13px] text-ink3 no-underline border-b border-(--border) hover:text-ink hover:border-(--border-md) transition-all">
          Ver todas →
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-10 max-md:grid-cols-2">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-bg2 border border-(--border) h-52 animate-pulse rounded-xs" />
          ))
        ) : (
          (galleries as GalleryWithCount[]).slice(0, 2).map((g, i) => (
            <div
              key={g.id}
              className={`bg-bg border overflow-hidden hover:border-(--border-md) hover:shadow-md hover:-translate-y-0.75 transition-all ease-[cubic-bezier(.22,1,.36,1)] reveal ${i > 0 ? `rd${i}` : ''} border-(--border)`}
            >
              {/* Preview */}
              <div className="h-32.5 overflow-hidden relative bg-bg2 flex items-center justify-center group">
                <GalleryPreview images={g.previewImages ?? []} wallColor={g.wallColor} />
                {/* Hover overlay con acceso rápido — siempre visible para el propietario */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10"
                  style={{ background: 'oklch(14% 0.010 75 / .42)' }}
                >
                  <Link
                    href={`/galleries/${g.slug}/viewer`}
                    className="text-[11px] px-3.5 py-1.5 bg-gold text-bg no-underline rounded-xs font-medium hover:bg-gold-hi transition-colors"
                  >
                    ◈ Ver 3D
                  </Link>
                </div>
              </div>

              <div className="px-4.5 py-4.5 pb-3.5">
                <div className="flex items-center justify-between mb-1 gap-2">
                  <span className="font-serif text-[17px] font-bold flex-1 leading-tight">{g.name}</span>
                  <span className={`text-[9px] tracking-[1.5px] uppercase px-2.25 py-0.75 rounded-[1px] font-medium shrink-0 border ${
                    g.visibility === 'PUBLIC'
                      ? 'bg-(--ok-dim) text-ok border-[oklch(56%_0.14_155/0.2)]'
                      : 'bg-(--border) text-ink3 border-(--border)'
                  }`}>
                    {g.visibility === 'PUBLIC' ? 'Pública' : 'Privada'}
                  </span>
                </div>
                <div className="text-[12px] text-ink3 mb-2.5">
                  {g.exposedCount} / {limits.artworksPerGallery} obras
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
              </div>

              <div className="flex gap-1.5 px-4.5 pb-3 border-t border-(--border) pt-3">
                <Link
                  href="/dashboard/artworks"
                  className="text-[12px] px-4 py-1.75 border border-(--border) rounded-xs text-ink3 no-underline hover:border-(--border-md) hover:text-ink transition-all"
                >
                  Gestionar obras
                </Link>
                <Link
                  href={`/galleries/${g.slug}`}
                  className="text-[12px] px-4 py-1.75 border border-(--border) rounded-xs text-ink3 no-underline hover:border-(--border-md) hover:text-ink transition-all"
                >
                  {g.visibility === 'PUBLIC' ? 'Ver pública →' : 'Previsualizar →'}
                </Link>
              </div>
            </div>
          ))
        )}

        {/* Slot de nueva galería */}
        {!isLoading && slots > 0 && (
          <Link
            href="/dashboard/galleries/new"
            className="border-2 border-dashed border-(--border) flex flex-col items-center justify-center gap-1.5 text-ink3 hover:border-gold hover:text-gold transition-colors min-h-50 reveal rd2 no-underline"
          >
            <span className="text-[24px] opacity-40">+</span>
            <span className="text-[13px]">Nueva galería</span>
            <span className="text-[11px] text-ink3 mt-0.5">{slots} slot{slots > 1 ? 's' : ''} disponible{slots > 1 ? 's' : ''}</span>
          </Link>
        )}
      </div>
    </div>
  )
}
