'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

type ShowcaseArtwork = {
  id:             string
  title:          string
  type:           string
  assetGallery:   string | null
  assetThumbnail: string | null
  viewCount:      number
  artist:         { name: string }
  slot: {
    gallery: { name: string; slug: string }
  } | null
}

// Posiciones del grid para las primeras 6 obras
const GRID_POSITIONS = [
  { col: '1/6',   row: '1/9'  },
  { col: '6/9',   row: '1/5'  },
  { col: '9/13',  row: '1/7'  },
  { col: '1/5',   row: '9/13' },
  { col: '5/9',   row: '5/9'  },
  { col: '9/13',  row: '7/13' },
]

export function ShowcaseGrid({ artworks }: { artworks: ShowcaseArtwork[] }) {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return
    const cards = grid.querySelectorAll<HTMLDivElement>('.wc')
    const cleanup: (() => void)[] = []

    cards.forEach(card => {
      const onMove = (e: MouseEvent) => {
        const r  = card.getBoundingClientRect()
        const nx = ((e.clientX - r.left) / r.width  - 0.5) * 8
        const ny = ((e.clientY - r.top)  / r.height - 0.5) * 8
        card.style.transform = `perspective(600px) rotateY(${nx}deg) rotateX(${-ny}deg) scale(1.015)`
      }
      const onLeave = () => {
        card.style.transform = ''
        card.style.transition = 'transform 0.6s cubic-bezier(.22,1,.36,1)'
        setTimeout(() => { card.style.transition = '' }, 600)
      }
      card.addEventListener('mousemove', onMove)
      card.addEventListener('mouseleave', onLeave)
      cleanup.push(() => {
        card.removeEventListener('mousemove', onMove)
        card.removeEventListener('mouseleave', onLeave)
      })
    })
    return () => cleanup.forEach(fn => fn())
  }, [])

  const TYPE_LABEL: Record<string, string> = {
    PAINTING:    'Pintura',
    SCULPTURE:   'Escultura',
    PHOTOGRAPHY: 'Fotografía',
    OTHER:       'Obra',
  }

  return (
    <>
      {/* Mobile/tablet: simple responsive grid */}
      <div className="grid grid-cols-2 gap-2 lg:hidden">
        {artworks.slice(0, 4).map((aw) => {
          const src = aw.assetGallery ?? aw.assetThumbnail
          return (
            <Link
              key={aw.id}
              href={`/artworks/${aw.id}`}
              className="aspect-4/3 relative group overflow-hidden bg-bg3 cursor-pointer"
            >
              {src ? (
                <Image
                  src={src}
                  alt={aw.title}
                  fill
                  sizes="(max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-ink3 text-4xl font-serif">◇</div>
              )}
              <div className="absolute inset-0 bg-ink opacity-0 group-hover:opacity-40 transition-opacity duration-400" />
              <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-[cubic-bezier(.22,1,.36,1)]">
                <p className="text-bg text-[10px] tracking-[2px] uppercase mb-0.5">
                  {TYPE_LABEL[aw.type] ?? 'Obra'} · {aw.artist.name}
                </p>
                <p className="text-bg font-serif text-[15px] font-bold leading-tight">{aw.title}</p>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Desktop: complex mosaic */}
      <div
        ref={gridRef}
        className="hidden lg:grid grid-cols-12 grid-rows-12 gap-1 aspect-4/3"
      >
        {artworks.slice(0, 6).map((aw, i) => {
          const pos = GRID_POSITIONS[i]
          const src = aw.assetGallery ?? aw.assetThumbnail
          return (
            <Link
              key={aw.id}
              href={`/artworks/${aw.id}`}
              className="wc relative group overflow-hidden bg-bg3 cursor-pointer"
              style={{ gridColumn: pos.col, gridRow: pos.row }}
            >
              {src ? (
                <Image
                  src={src}
                  alt={aw.title}
                  fill
                  sizes="(max-width: 1280px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-ink3 text-4xl font-serif">◇</div>
              )}
              <div className="absolute inset-0 bg-ink opacity-0 group-hover:opacity-40 transition-opacity duration-400" />
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-[cubic-bezier(.22,1,.36,1)]">
                <p className="text-bg text-[11px] tracking-[2px] uppercase mb-1">
                  {TYPE_LABEL[aw.type] ?? 'Obra'} · {aw.artist.name}
                </p>
                <p className="text-bg font-serif text-[18px] font-bold leading-tight">{aw.title}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </>
  )
}

export function ShowcaseEmpty() {
  return (
    <div className="border border-(--border) py-24 flex flex-col items-center gap-5 text-center reveal">
      <span className="font-serif text-[56px] text-ink3/20 leading-none">◇</span>
      <p className="text-[11px] tracking-[3px] uppercase text-ink3">Próximamente</p>
      <p className="text-[15px] text-ink3 max-w-xs">
        Las obras más visitadas aparecerán aquí conforme los artistas publiquen su colección.
      </p>
      <Link
        href="/sign-up"
        className="mt-2 text-[12px] tracking-[2px] uppercase border-b border-(--border-md) pb-0.5 hover:border-ink transition-colors"
      >
        Abre tu galería →
      </Link>
    </div>
  )
}
