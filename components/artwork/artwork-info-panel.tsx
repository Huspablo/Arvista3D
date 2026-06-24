'use client'

import Link from 'next/link'

interface ArtworkData {
  title:       string
  artist:      string
  artistId:    string
  type:        string
  year:        number
  dims:        string
  technique:   string
  edition:     string
  gallery:     string | null
  gallerySlug: string | null
  description: string
}

interface Props {
  artwork: ArtworkData
}

export function ArtworkInfoPanel({ artwork }: Props) {
  // L11 — filtrar celdas vacías o con valor '0' (año sin rellenar)
  const metaAll: [string, string][] = [
    ['Técnica',     artwork.technique],
    ['Año',         String(artwork.year)],
    ['Dimensiones', artwork.dims],
    ['Edición',     artwork.edition],
  ]
  const meta      = metaAll.filter(([, v]) => v && v !== '0' && v.trim() !== '')
  const lastAlone = meta.length % 2 === 1

  return (
    <div className="px-11 py-10 overflow-y-auto max-md:px-6 max-md:py-8 md:h-full">
      {/* Tag */}
      <span className="text-[11px] tracking-[5px] uppercase text-gold mb-4 block reveal">
        {artwork.type}
        {artwork.gallery && ` · ${artwork.gallery}`}
      </span>

      {/* Title */}
      <h1
        className="font-serif font-black leading-[.95] mb-2 reveal rd1"
        style={{ fontSize: 'clamp(32px, 4vw, 52px)' }}
      >
        {artwork.title}
      </h1>

      <p className="text-[15px] text-ink2 mb-8 reveal rd2">
        Por{' '}
        <Link href={`/artists/${artwork.artistId}`}
          className="text-ink no-underline border-b border-(--border-md) hover:border-gold transition-colors">
          {artwork.artist}
        </Link>
      </p>

      {/* L11 — meta grid solo si hay al menos un campo con datos */}
      {meta.length > 0 && (
        <div className="grid grid-cols-2 border border-(--border) mb-8 reveal rd2">
          {meta.map(([label, val], i) => {
            const isAlone    = lastAlone && i === meta.length - 1
            const isRightCol = i % 2 === 1
            const isLastRow  = i >= meta.length - (lastAlone ? 1 : 2)
            return (
              <div
                key={label}
                className={[
                  'px-4.5 py-4',
                  isAlone   ? 'col-span-2' : '',
                  !isRightCol && !isAlone ? 'border-r border-(--border)' : '',
                  !isLastRow ? 'border-b border-(--border)' : '',
                ].filter(Boolean).join(' ')}
              >
                <div className="text-[10px] tracking-[3px] uppercase text-ink3 mb-1">{label}</div>
                <div className="text-[15px] font-medium">{val}</div>
              </div>
            )
          })}
        </div>
      )}

      {/* L6 — descripción solo si hay texto */}
      {artwork.description?.trim() && (
        <p className="text-[15px] leading-[1.85] text-ink2 mb-9 reveal rd3">
          {artwork.description}
        </p>
      )}

      {/* Gallery badge */}
      {artwork.gallery && artwork.gallerySlug && (
        <Link
          href={`/galleries/${artwork.gallerySlug}`}
          className="inline-flex items-center gap-2 px-4 py-2 border mb-8 text-[12px] tracking-[2px] uppercase no-underline reveal rd3 hover:bg-[oklch(60%_0.130_82/0.18)] transition-colors"
          style={{
            borderColor: 'oklch(60% 0.130 82 / .25)',
            background:  'var(--gold-dim)',
            color:       'var(--color-gold)',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
          Expuesta · {artwork.gallery} →
        </Link>
      )}

      {/* M8 — CTA solo si la obra está asignada a una galería; sin botón fantasma */}
      {artwork.gallerySlug && (
        <Link
          href={`/galleries/${artwork.gallerySlug}#artist`}
          className="w-full py-4 bg-ink text-bg font-medium text-[14px] tracking-[.4px] rounded-xs hover:-translate-y-px hover:shadow-md transition-all ease-[cubic-bezier(.22,1,.36,1)] relative overflow-hidden group reveal rd4 flex items-center justify-center no-underline"
        >
          <span className="absolute inset-0 bg-gold -translate-x-full group-hover:translate-x-0 transition-transform duration-400 ease-[cubic-bezier(.22,1,.36,1)]" />
          <span className="relative z-1">Contactar artista</span>
        </Link>
      )}
    </div>
  )
}
