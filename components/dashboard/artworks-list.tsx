'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useArtworks, usePublishArtwork, useUnpublishArtwork, useDeleteArtwork, type ArtworkWithGallery } from '@/lib/hooks/use-artworks'
import { useGalleries } from '@/lib/hooks/use-galleries'
import type { ArtworkType, Gallery } from '@prisma/client'
import { TYPE_LABEL } from '@/lib/labels'
import { useFocusTrap } from '@/lib/hooks/use-focus-trap'

// ── Constantes ────────────────────────────────────────────────────────────────

const TYPE_FILTERS   = ['Todas', 'Pintura', 'Escultura', 'Fotografía', 'Otro'] as const
const STATUS_FILTERS = ['Todas', 'Expuestas', 'Borradores'] as const

const TYPE_MAP: Record<string, ArtworkType> = {
  Pintura: 'PAINTING', Escultura: 'SCULPTURE', Fotografía: 'PHOTOGRAPHY', Otro: 'OTHER',
}

// ── Iconos SVG inline ─────────────────────────────────────────────────────────

function IconEdit() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8.5 1.5 10.5 3.5 4 10H2V8L8.5 1.5z" />
    </svg>
  )
}

function IconEye() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 7s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z" />
      <circle cx="7" cy="7" r="1.5" />
    </svg>
  )
}

function IconTrash() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1.5 3h9M4.5 3V2h3v1M10 3 9.5 10a.5.5 0 0 1-.5.5h-4a.5.5 0 0 1-.5-.5L4 3" />
      <path d="M5 5.5v3M7 5.5v3" />
    </svg>
  )
}

// ── Skeleton de carga ─────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-bg flex flex-col overflow-hidden border border-(--border)">
      <div className="aspect-4/3 bg-bg3 relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-bg2/80 to-transparent animate-[skeleton-sweep_1.6s_ease-in-out_infinite]" />
      </div>
      <div className="px-5 pt-4 pb-3 flex-1 flex flex-col gap-2.5">
        <div className="h-4 w-3/4 bg-bg3 rounded-xs" />
        <div className="h-3 w-1/4 bg-bg3 rounded-xs" />
      </div>
      <div className="px-5 py-3 border-t border-(--border) flex items-center gap-2">
        <div className="h-7 w-14 bg-bg3 rounded-xs" />
        <div className="h-7 w-18 bg-bg3 rounded-xs" />
        <div className="ml-auto h-7 w-7 bg-bg3 rounded-xs" />
      </div>
    </div>
  )
}

// ── Tarjeta de obra individual ────────────────────────────────────────────────

interface ArtworkCardProps {
  artwork:         ArtworkWithGallery
  galleries:       Pick<Gallery, 'id' | 'name' | 'visibility'>[]
  publishingId:    string | null
  canPublish:      boolean
  onPublish:       (id: string) => void
  onUnpublish:     (id: string) => void
  onDeleteRequest: (id: string, title: string) => void
}

function ArtworkCard({
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

// ── Componente principal ──────────────────────────────────────────────────────

export function ArtworksList() {
  const { data: artworks = [], isLoading } = useArtworks()
  const { data: galleries = [] }           = useGalleries()
  const publishArtwork                     = usePublishArtwork()
  const unpublishArtwork                   = useUnpublishArtwork()
  const deleteArtwork                      = useDeleteArtwork()

  const [typeFilter,   setTypeFilter]   = useState('Todas')
  const [statusFilter, setStatusFilter] = useState('Todas')
  const [search,       setSearch]       = useState('')
  const [sortBy,       setSortBy]       = useState<'default' | 'az'>('default')
  const [publishingId, setPublishingId] = useState<string | null>(null)
  const [galleryModal, setGalleryModal] = useState<string | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null)
  const [isDeleting,   setIsDeleting]   = useState(false)
  const galleryModalRef                 = useRef<HTMLDivElement>(null)
  const deleteModalRef                  = useRef<HTMLDivElement>(null)
  useFocusTrap(galleryModalRef, !!galleryModal)
  useFocusTrap(deleteModalRef,  !!deleteTarget)

  // Contadores para mostrar en los chips de filtro
  const typeCounts = artworks.reduce<Partial<Record<ArtworkType, number>>>((acc, a) => {
    acc[a.type] = (acc[a.type] ?? 0) + 1
    return acc
  }, {})
  const exposedCount = artworks.filter(a => a.status === 'EXPOSED').length
  const draftCount   = artworks.filter(a => a.status === 'DRAFT').length

  const filtered = artworks.filter(a => {
    if (typeFilter !== 'Todas' && a.type !== TYPE_MAP[typeFilter]) return false
    if (statusFilter === 'Expuestas'  && a.status !== 'EXPOSED') return false
    if (statusFilter === 'Borradores' && a.status !== 'DRAFT')   return false
    if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const sorted = sortBy === 'az'
    ? [...filtered].sort((a, b) => a.title.localeCompare(b.title, 'es'))
    : filtered

  const handlePublish = (artworkId: string) => {
    if (galleries.length === 0) return
    if (galleries.length === 1) {
      setPublishingId(artworkId)
      publishArtwork.mutate(
        { id: artworkId, galleryId: galleries[0].id },
        { onSettled: () => setPublishingId(null) },
      )
    } else {
      setGalleryModal(artworkId)
    }
  }

  const handleUnpublish = (artworkId: string) => {
    setPublishingId(artworkId)
    unpublishArtwork.mutate(artworkId, { onSettled: () => setPublishingId(null) })
  }

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    deleteArtwork.mutate(deleteTarget.id, {
      onSuccess: () => { setDeleteTarget(null); setIsDeleting(false) },
      onError:   () => setIsDeleting(false),
    })
  }

  const hasActiveFilters = typeFilter !== 'Todas' || statusFilter !== 'Todas' || search
  const clearFilters     = () => { setTypeFilter('Todas'); setStatusFilter('Todas'); setSearch('') }

  return (
    <>
      {/* ── Modal: selección de galería ── */}
      {galleryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm">
          <div ref={galleryModalRef} role="dialog" aria-modal="true" aria-label="Seleccionar galería" className="bg-bg border border-(--border) p-6 w-80 max-w-[calc(100vw-2rem)] shadow-2xl">
            <h3 className="font-serif text-[18px] font-bold mb-4">¿En qué galería exponer?</h3>
            <div className="flex flex-col gap-2 mb-4">
              {galleries.map(g => (
                <button
                  key={g.id}
                  onClick={() => {
                    setPublishingId(galleryModal)
                    publishArtwork.mutate(
                      { id: galleryModal, galleryId: g.id },
                      { onSettled: () => { setPublishingId(null); setGalleryModal(null) } },
                    )
                  }}
                  className="text-left px-4 py-3 border border-(--border) hover:border-gold hover:bg-(--gold-dim) transition-all text-[13px]"
                >
                  {g.name}
                  <span className={`ml-2 text-[10px] ${g.visibility === 'PUBLIC' ? 'text-ok' : 'text-ink3'}`}>
                    {g.visibility === 'PUBLIC' ? 'Pública' : 'Privada'}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setGalleryModal(null)}
              className="text-[12px] text-ink3 hover:text-ink transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* ── Modal: confirmación de borrado ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 backdrop-blur-sm">
          <div ref={deleteModalRef} role="dialog" aria-modal="true" aria-label="Eliminar obra" className="bg-bg border border-(--border) p-8 w-96 max-w-[calc(100vw-2rem)] shadow-2xl">
            <h3 className="font-serif text-[22px] font-bold mb-2">Eliminar obra</h3>
            <p className="text-[14px] text-ink2 mb-1">Vas a eliminar permanentemente:</p>
            <p className="font-medium text-[15px] mb-6 font-serif">"{deleteTarget.title}"</p>
            <div
              className="text-[13px] px-4 py-3 rounded-xs mb-7 flex items-start gap-2"
              style={{
                borderLeft: '3px solid oklch(62% 0.18 32 / 0.5)',
                background: 'oklch(62% 0.18 32 / 0.06)',
                color:      'var(--color-warn)',
              }}
            >
              <span className="shrink-0 mt-px">⚠</span>
              <span>Esta acción no se puede deshacer. Si la obra está expuesta, también se retirará de la galería.</span>
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
                {isDeleting ? 'Eliminando…' : 'Eliminar obra'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Barra de filtros sticky ── */}
      <div className="px-12 py-3.5 flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-(--border) bg-bg/95 sticky top-16 z-10 max-md:px-6 max-md:gap-3" style={{ backdropFilter: 'blur(12px)' }}>

        {/* Grupo: Tipo */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] tracking-[2px] uppercase text-ink3 shrink-0 select-none">Tipo</span>
          <div className="flex gap-1.5 flex-wrap">
            {TYPE_FILTERS.map(f => {
              const count = f === 'Todas'
                ? artworks.length
                : (typeCounts[TYPE_MAP[f]] ?? 0)
              return (
                <button
                  key={f}
                  onClick={() => setTypeFilter(f)}
                  className={`text-[12px] px-3.5 py-1.5 rounded-xs transition-all ${
                    typeFilter === f
                      ? 'bg-gold text-bg font-medium shadow-sm'
                      : 'border border-(--border) text-ink3 hover:border-(--border-md) hover:text-ink'
                  }`}
                >
                  {f}
                  {f !== 'Todas' && count > 0 && (
                    <span className={`ml-1 text-[10px] opacity-70`}>{count}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="w-px h-5 bg-(--border) self-center max-md:hidden" />

        {/* Grupo: Estado */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] tracking-[2px] uppercase text-ink3 shrink-0 select-none">Estado</span>
          <div className="flex gap-1.5">
            {STATUS_FILTERS.map(f => {
              const count = f === 'Expuestas' ? exposedCount : f === 'Borradores' ? draftCount : artworks.length
              return (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`text-[12px] px-3.5 py-1.5 rounded-xs transition-all ${
                    statusFilter === f
                      ? 'bg-gold text-bg font-medium shadow-sm'
                      : 'border border-(--border) text-ink3 hover:border-(--border-md) hover:text-ink'
                  }`}
                >
                  {f}
                  {f !== 'Todas' && count > 0 && (
                    <span className="ml-1 text-[10px] opacity-70">{count}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Buscador y ordenación — extremo derecho */}
        <div className="ml-auto flex items-center gap-2.5 max-md:w-full max-md:ml-0">
          {/* Orden A-Z */}
          <button
            onClick={() => setSortBy(s => s === 'az' ? 'default' : 'az')}
            title={sortBy === 'az' ? 'Volver al orden original' : 'Ordenar A-Z'}
            className={`text-[11px] px-3 py-1.75 border rounded-xs transition-all shrink-0 ${
              sortBy === 'az'
                ? 'border-gold text-gold bg-(--gold-dim)'
                : 'border-(--border) text-ink3 hover:border-(--border-md) hover:text-ink'
            }`}
          >
            A-Z
          </button>

          {/* Buscador */}
          <div className="flex items-center gap-2 border border-(--border) rounded-xs px-3 py-1.75 bg-bg3 focus-within:border-(--border-md) transition-colors max-md:flex-1">
            <span className="text-ink3 text-[15px] leading-none select-none">⌕</span>
            <input
              type="text"
              placeholder="Buscar obras…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-[13px] text-ink placeholder:text-ink3 w-32 focus:w-52 transition-[width] duration-300 max-md:flex-1"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-ink3 hover:text-ink transition-colors text-[14px] leading-none"
                aria-label="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Contador y limpiar filtros ── */}
      <div className="px-12 pt-5 pb-3 flex items-center gap-3 max-md:px-6">
        <span className="text-[13px] text-ink3">
          {isLoading
            ? 'Cargando…'
            : artworks.length === 0
              ? 'Sin obras'
              : filtered.length === artworks.length
                ? `${artworks.length} obra${artworks.length !== 1 ? 's' : ''}`
                : `${filtered.length} de ${artworks.length} obra${artworks.length !== 1 ? 's' : ''}`}
        </span>
        {hasActiveFilters && !isLoading && (
          <button
            onClick={clearFilters}
            className="text-[11px] text-ink3 hover:text-ink transition-colors px-2 py-0.75 border border-(--border) rounded-[10px] hover:border-(--border-md)"
          >
            Limpiar ✕
          </button>
        )}
      </div>

      {/* ── Grid de obras ── */}
      <div className="px-12 pb-16 grid gap-6 max-md:px-6 max-md:gap-4 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
        {isLoading ? (
          [1, 2, 3, 4].map(i => <SkeletonCard key={i} />)
        ) : sorted.length > 0 ? (
          sorted.map(a => (
            <ArtworkCard
              key={a.id}
              artwork={a}
              galleries={galleries}
              publishingId={publishingId}
              canPublish={galleries.length > 0}
              onPublish={handlePublish}
              onUnpublish={handleUnpublish}
              onDeleteRequest={(id, title) => setDeleteTarget({ id, title })}
            />
          ))
        ) : null}

        {/* Empty state: sin obras todavía */}
        {!isLoading && artworks.length === 0 && (
          <div className="col-span-full bg-bg flex flex-col items-center justify-center py-24 gap-4 text-ink3">
            <span className="font-serif text-[48px] opacity-10">◇</span>
            <p className="text-[15px] font-medium text-ink2">Aún no has creado ninguna obra</p>
            <p className="text-[13px] opacity-70">Sube tu primera obra y empieza a construir tu galería virtual.</p>
            <Link
              href="/dashboard/artworks/new"
              className="mt-2 text-[13px] px-6 py-2.5 bg-ink text-bg rounded-xs no-underline hover:-translate-y-px transition-all ease-[cubic-bezier(.22,1,.36,1)]"
            >
              + Crear primera obra
            </Link>
          </div>
        )}

        {/* Empty state: sin resultados con los filtros activos */}
        {!isLoading && artworks.length > 0 && filtered.length === 0 && (
          <div className="col-span-full bg-bg flex flex-col items-center justify-center py-20 gap-3 text-ink3">
            <span className="text-[32px] opacity-20">⌕</span>
            <p className="text-[14px]">
              {search
                ? `Sin resultados para "${search}"`
                : typeFilter !== 'Todas' && statusFilter !== 'Todas'
                  ? `No hay obras de tipo ${typeFilter} en ${statusFilter.toLowerCase()}`
                  : typeFilter !== 'Todas'
                    ? `No tienes obras de tipo ${typeFilter}`
                    : `No tienes obras en ${statusFilter.toLowerCase()}`}
            </p>
            <button
              onClick={clearFilters}
              className="text-[12px] text-ink3 hover:text-ink transition-colors border-b border-(--border) hover:border-(--border-md) pb-px"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </>
  )
}
