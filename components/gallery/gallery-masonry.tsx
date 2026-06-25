'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback } from 'react'

interface Artwork {
  id:        string
  title:     string
  type:      string
  year:      number
  thumbnail: string | null
  gridCol:   string
  gridRow:   string
}

interface Props {
  artworks: Artwork[]
}

const HOVER_OVERLAY = 'linear-gradient(180deg, transparent 30%, oklch(97.5% 0.007 75 / .94) 100%)'

function ArtworkCard({
  a, i, className, style, onMouseMove, onMouseLeave,
}: {
  a: Artwork
  i: number
  className?: string
  style?: React.CSSProperties
  onMouseMove: (e: React.MouseEvent<HTMLAnchorElement>) => void
  onMouseLeave: (e: React.MouseEvent<HTMLAnchorElement>) => void
}) {
  return (
    <Link
      href={`/artworks/${a.id}`}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={`overflow-hidden relative border border-(--border) no-underline group reveal bg-bg2 ${i > 0 ? `rd${Math.min(i, 4)}` : ''} ${className ?? ''}`}
      style={{
        transformStyle: 'preserve-3d',
        transition:     'box-shadow 0.4s, border-color 0.4s, transform 0.4s cubic-bezier(.22,1,.36,1)',
        ...style,
      }}
    >
      {a.thumbnail
        ? <Image src={a.thumbnail} alt={a.title} fill sizes="(max-width: 768px) 50vw, 600px" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
        : <div className="w-full h-full flex items-center justify-center"><span className="font-serif text-[40px] opacity-10">◇</span></div>
      }
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex flex-col justify-end p-5"
        style={{ background: HOVER_OVERLAY }}
      >
        <h3 className="font-serif text-[18px] font-bold mb-0.5 text-ink leading-tight">{a.title}</h3>
        <p className="text-[11px] text-ink3 tracking-[2px] uppercase mb-2.5">{a.type} · {a.year}</p>
        <span className="inline-flex items-center gap-2 text-[11px] text-gold tracking-[2px] uppercase">Ver obra →</span>
      </div>
    </Link>
  )
}

export function GalleryMasonry({ artworks }: Props) {
  const onMouseMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const el   = e.currentTarget
    const rect = el.getBoundingClientRect()
    const x    = (e.clientX - rect.left)  / rect.width  - 0.5
    const y    = (e.clientY - rect.top)   / rect.height - 0.5
    el.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 6}deg) scale(1.02)`
  }, [])

  const onMouseLeave = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.transform = ''
  }, [])

  // ── Estado vacío ────────────────────────────────────────────────────────────
  if (artworks.length === 0) {
    return (
      <div className="flex flex-col items-center gap-5 py-14 text-center border border-(--border) border-dashed">
        <svg viewBox="0 0 80 56" fill="none" className="text-ink3 opacity-15 w-18" aria-hidden="true">
          <rect x="1" y="7" width="30" height="41" stroke="currentColor" strokeWidth="1.5"/>
          <rect x="37" y="14" width="22" height="28" stroke="currentColor" strokeWidth="1.5"/>
          <rect x="64" y="10" width="15" height="35" stroke="currentColor" strokeWidth="1.5"/>
          <line x1="0" y1="52" x2="80" y2="52" stroke="currentColor" strokeWidth="1"/>
        </svg>
        <p className="font-serif text-[24px] font-bold text-ink2 leading-none">La sala está vacía</p>
        <p className="text-[13px] text-ink3 max-w-60 leading-[1.7]">
          Todavía no hay obras expuestas en esta galería.
        </p>
      </div>
    )
  }

  // ── 1–2 obras: layout centrado ──────────────────────────────────────────────
  if (artworks.length <= 2) {
    const isSingle = artworks.length === 1
    return (
      <>
        {/* Desktop */}
        <div className={`hidden md:flex gap-3 ${isSingle ? 'max-w-150' : ''}`}>
          {artworks.map((a, i) => (
            <ArtworkCard
              key={a.id}
              a={a}
              i={i}
              onMouseMove={onMouseMove}
              onMouseLeave={onMouseLeave}
              className={isSingle ? 'w-full' : 'flex-1'}
              style={{ aspectRatio: isSingle ? '4/3' : '3/4' }}
            />
          ))}
        </div>
        {/* Mobile */}
        <div className="md:hidden grid grid-cols-2 gap-2.5">
          {artworks.map((a) => (
            <Link
              key={a.id}
              href={`/artworks/${a.id}`}
              className="aspect-4/3 relative overflow-hidden border border-(--border) no-underline group bg-bg2"
            >
              {a.thumbnail
                ? <Image src={a.thumbnail} alt={a.title} fill sizes="(max-width: 768px) 50vw, 600px" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                : <div className="w-full h-full flex items-center justify-center"><span className="font-serif text-[28px] opacity-10">◇</span></div>
              }
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex flex-col justify-end p-4" style={{ background: HOVER_OVERLAY }}>
                <h3 className="font-serif text-[15px] font-bold mb-0.5 text-ink leading-tight">{a.title}</h3>
                <p className="text-[10px] text-ink3 tracking-[2px] uppercase">{a.type} · {a.year}</p>
              </div>
            </Link>
          ))}
        </div>
      </>
    )
  }

  // ── 3+ obras: masonry completo ──────────────────────────────────────────────
  return (
    <>
      {/* Mobile: 2 columnas */}
      <div className="md:hidden grid grid-cols-2 gap-2.5">
        {artworks.map((a) => (
          <Link
            key={a.id}
            href={`/artworks/${a.id}`}
            className="aspect-4/3 relative overflow-hidden border border-(--border) no-underline group bg-bg2"
          >
            {a.thumbnail
              ? <Image src={a.thumbnail} alt={a.title} fill sizes="(max-width: 768px) 50vw, 600px" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
              : <div className="w-full h-full flex items-center justify-center"><span className="font-serif text-[28px] opacity-10">◇</span></div>
            }
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex flex-col justify-end p-4" style={{ background: HOVER_OVERLAY }}>
              <h3 className="font-serif text-[15px] font-bold mb-0.5 text-ink leading-tight">{a.title}</h3>
              <p className="text-[10px] text-ink3 tracking-[2px] uppercase">{a.type} · {a.year}</p>
            </div>
          </Link>
        ))}
      </div>
      {/* Desktop: masonry 12 cols */}
      <div
        className="hidden md:grid"
        style={{ gridTemplateColumns: 'repeat(12, 1fr)', gridAutoRows: '44px', gap: '8px' }}
      >
        {artworks.map((a, i) => (
          <ArtworkCard
            key={a.id}
            a={a}
            i={i}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            style={{ gridColumn: a.gridCol, gridRow: a.gridRow }}
          />
        ))}
      </div>
    </>
  )
}
