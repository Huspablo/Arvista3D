'use client'

import Link from 'next/link'
import { useGalleries } from '@/lib/hooks/use-galleries'

const STEPS = [
  {
    num:   '01',
    title: 'Crea tu galería',
    desc:  'Define el espacio 3D donde expondrás tus obras al mundo.',
    href:  '/dashboard/galleries/new',
    cta:   'Crear galería →',
  },
  {
    num:   '02',
    title: 'Sube tus obras',
    desc:  'Añade pinturas, esculturas o fotografías a tu colección.',
    href:  '/dashboard/artworks/new',
    cta:   'Añadir obra →',
  },
  {
    num:   '03',
    title: 'Publica y comparte',
    desc:  'Expón tus obras en la galería y comparte el enlace 3D.',
    href:  '/dashboard/artworks',
    cta:   'Ver mis obras →',
  },
]

export function FirstStepsBanner() {
  const { data: galleries = [], isLoading } = useGalleries()

  // Solo visible cuando el artista no tiene galerías aún
  if (isLoading || galleries.length > 0) return null

  return (
    <div className="mb-10 border border-(--border) bg-bg2 reveal">
      <div className="px-6 py-4 border-b border-(--border) flex items-center gap-3">
        <span className="text-[9px] tracking-[4px] uppercase text-ink3">Bienvenido a Arvista</span>
        <span className="w-1 h-1 rounded-full bg-gold shrink-0" />
        <span className="text-[11px] text-ink3">Tres pasos para empezar</span>
      </div>
      <div className="grid grid-cols-3 divide-x divide-(--border) max-md:grid-cols-1 max-md:divide-x-0 max-md:divide-y max-md:divide-(--border)">
        {STEPS.map(s => (
          <div key={s.num} className="px-6 py-6 flex flex-col gap-3">
            <span
              className="font-serif font-black leading-none select-none text-ink"
              style={{ fontSize: 'clamp(36px, 4vw, 48px)', opacity: 0.06 }}
            >
              {s.num}
            </span>
            <div>
              <div className="font-serif text-[16px] font-bold mb-1">{s.title}</div>
              <p className="text-[13px] text-ink3 leading-relaxed">{s.desc}</p>
            </div>
            <Link
              href={s.href}
              className="self-start mt-auto text-[12px] px-4 py-2 border border-(--border) rounded-xs text-ink3 no-underline hover:border-gold hover:text-gold transition-all"
            >
              {s.cta}
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
