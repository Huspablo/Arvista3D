'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MOCK_ARTWORKS } from '@/lib/mock-data/landing'

export function ShowcaseSection() {
  const gridRef = useRef<HTMLDivElement>(null)

  // Card tilt on mouse move
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
        card.style.transition = 'transform 0.6s cubic-bezier(.22,1,.36,1), box-shadow 0.4s, border-color 0.4s'
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

  return (
    <section className="px-15 pb-30 max-md:px-6 max-md:pb-20" id="obras">
      <div className="max-w-370 mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end border-b border-(--border) pb-7 mb-10 reveal max-md:flex-col max-md:items-start max-md:gap-4">
          <div>
            <span className="text-[11px] tracking-[6px] uppercase text-gold mb-5 block">Catálogo</span>
            <h2
              className="font-serif font-black leading-[.95]"
              style={{ fontSize: 'clamp(36px, 5vw, 68px)' }}
            >
              Obras <em className="italic text-gold">destacadas</em>
            </h2>
          </div>
          <Link
            href="/obras"
            className="text-ink2 text-[13px] tracking-[2px] no-underline uppercase border-b border-(--border-md) pb-0.5 hover:border-ink hover:text-ink transition-all whitespace-nowrap"
          >
            Ver todas las obras →
          </Link>
        </div>

        {/* Masonry grid */}
        <div
          ref={gridRef}
          className="grid gap-2.5 max-md:grid-cols-2 max-md:auto-rows-[36px] max-sm:grid-cols-1"
          style={{
            gridTemplateColumns: 'repeat(12, 1fr)',
            gridAutoRows: '44px',
          }}
        >
          {MOCK_ARTWORKS.map((w, i) => (
            <div
              key={w.title}
              className={`wc overflow-hidden relative border border-(--border) hover:shadow-lg hover:border-(--border-md) hover:z-5 transition reveal ${i % 3 === 1 ? 'rd1' : i % 3 === 2 ? 'rd2' : ''} max-md:col-[span_1]! max-md:row-[span_4]! first:max-md:col-[span_2]! first:max-md:row-[span_6]!`}
              style={{
                gridColumn: w.col,
                gridRow: w.row,
              }}
            >
              <Image
                src={w.src}
                alt={w.title}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover"
                priority={i === 0}
              />
              {/* Info overlay */}
              <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-400 flex flex-col justify-end p-5"
                style={{ background: 'linear-gradient(180deg, transparent 20%, oklch(97.5% 0.007 75 / 0.94) 100%)' }}
              >
                <div className="font-serif text-[18px] font-bold mb-0.75 text-ink">{w.title}</div>
                <div className="text-[11px] text-ink3 tracking-[2px] uppercase">{w.meta}</div>
                <div className="mt-2.5 text-[11px] text-gold tracking-[2px] uppercase inline-flex items-center gap-1.5">
                  Ver obra →
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
