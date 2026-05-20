'use client'

import Link from 'next/link'
import { useCallback } from 'react'

interface Artwork {
  id:      string
  title:   string
  type:    string
  year:    number
  art:     string
  gridCol: string
  gridRow: string
}

interface Props {
  artworks:    Artwork[]
  gallerySlug: string
}

export function GalleryMasonry({ artworks, gallerySlug }: Props) {
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

  return (
    <div className="px-15 py-8 max-w-370 mx-auto max-md:px-4">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gridAutoRows: '52px',
          gap: '10px',
        }}
      >
        {artworks.map((a, i) => (
          <Link
            key={a.id}
            href={`/artworks/${a.id}`}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            className={`overflow-hidden relative border border-(--border) no-underline group reveal ${i > 0 && i < 4 ? `rd${i}` : ''}`}
            style={{
              gridColumn:     a.gridCol,
              gridRow:        a.gridRow,
              transformStyle: 'preserve-3d',
              transition:     'box-shadow 0.4s, border-color 0.4s, transform 0.4s cubic-bezier(.22,1,.36,1)',
            }}
          >
            {/* Art background */}
            <div
              className={`w-full h-full ${a.art} transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04]`}
            />

            {/* Hover overlay */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex flex-col justify-end p-5.5"
              style={{ background: 'linear-gradient(180deg, transparent 25%, oklch(97.5% 0.007 75 / .95) 100%)' }}
            >
              <h3 className="font-serif text-[20px] font-bold mb-1 text-ink">{a.title}</h3>
              <p className="text-[11px] text-ink3 tracking-[2px] uppercase mb-3">
                {a.type} · {a.year}
              </p>
              <span className="inline-flex items-center gap-2 text-[12px] text-gold tracking-[2px] uppercase">
                Ver obra →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
