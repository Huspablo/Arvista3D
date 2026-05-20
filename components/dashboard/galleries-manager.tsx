'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Gallery {
  id:         string
  name:       string
  slug:       string
  visibility: 'public' | 'private'
  artCount:   number
  maxArts:    number
  visits:     number
  updatedAt:  string
  art:        string
}

const GALLERIES: Gallery[] = [
  {
    id:         'gal_01',
    name:       'Texturas urbanas',
    slug:       'texturas-urbanas',
    visibility: 'public',
    artCount:   8,
    maxArts:    10,
    visits:     847,
    updatedAt:  'hace 2 días',
    art:        'art-p1',
  },
  {
    id:         'gal_02',
    name:       'Agua & Forma',
    slug:       'agua-y-forma',
    visibility: 'private',
    artCount:   3,
    maxArts:    10,
    visits:     0,
    updatedAt:  'hace 12 días',
    art:        'art-p2',
  },
]

const BAR_COLOR = { public: 'var(--color-ok)', private: 'var(--color-gold)' }

export function GalleriesManager() {
  const [galleries, setGalleries] = useState(GALLERIES)

  const toggleVisibility = (id: string) => {
    setGalleries(prev =>
      prev.map(g =>
        g.id === id
          ? { ...g, visibility: g.visibility === 'public' ? 'private' : 'public' }
          : g,
      ),
    )
  }

  return (
    <div>
      {/* Plan usage banner */}
      <div className="flex items-center justify-between mb-8 p-5 border border-(--border) bg-bg2 reveal">
        <div className="flex items-center gap-6">
          <div>
            <div className="text-[10px] tracking-[3px] uppercase text-ink3 mb-1.5">Plan actual</div>
            <div className="font-serif text-[20px] font-bold">Estándar</div>
          </div>
          <div className="w-px h-10 bg-(--border)" />
          <div>
            <div className="text-[10px] tracking-[3px] uppercase text-ink3 mb-1.5">Galerías</div>
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-[28px] font-black leading-none">2</span>
              <span className="text-[14px] text-ink3">/ 3 disponibles</span>
            </div>
          </div>
          <div>
            <div className="w-32 h-0.75 bg-(--border) rounded-sm overflow-hidden">
              <div className="h-full rounded-sm bg-ok" style={{ width: '67%' }} />
            </div>
            <div className="text-[11px] text-ink3 mt-1">1 slot libre</div>
          </div>
        </div>
        <Link
          href="/dashboard/plan"
          className="text-[12px] px-4 py-2 border border-(--border) rounded-xs text-ink3 no-underline hover:border-(--border-md) hover:text-ink transition-all max-md:hidden"
        >
          Ver plan →
        </Link>
      </div>

      {/* Gallery grid */}
      <div className="grid gap-4 max-md:grid-cols-1" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
        {galleries.map((g, i) => (
          <div
            key={g.id}
            className={`bg-bg border border-(--border) overflow-hidden hover:border-(--border-md) hover:shadow-md hover:-translate-y-0.75 transition-all ease-[cubic-bezier(.22,1,.36,1)] reveal ${i > 0 ? `rd${i}` : ''}`}
          >
            {/* Thumbnail */}
            <div className="relative h-45 overflow-hidden group">
              <div className={`w-full h-full ${g.art} transition-transform duration-600 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04]`} />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3"
                style={{ background: 'oklch(14% 0.010 75 / .45)' }}
              >
                {g.visibility === 'public' && (
                  <Link
                    href={`/galleries/${g.slug}/viewer`}
                    className="text-[12px] px-4 py-2 bg-gold text-bg no-underline rounded-xs font-medium hover:bg-gold-hi transition-colors"
                  >
                    ◈ Ver 3D
                  </Link>
                )}
                <Link
                  href={`/galleries/${g.slug}`}
                  className="text-[12px] px-4 py-2 bg-bg text-ink no-underline rounded-xs hover:bg-bg2 transition-colors"
                >
                  Ver pública →
                </Link>
              </div>
            </div>

            {/* Body */}
            <div className="px-5 py-4">
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="font-serif text-[19px] font-bold leading-tight">{g.name}</span>
                <span
                  className={`text-[9px] tracking-[1.5px] uppercase px-2.25 py-0.75 rounded-[1px] font-medium shrink-0 border mt-0.75 ${
                    g.visibility === 'public'
                      ? 'bg-(--ok-dim) text-ok border-[oklch(56%_0.14_155/0.2)]'
                      : 'bg-(--border) text-ink3 border-(--border)'
                  }`}
                >
                  {g.visibility === 'public' ? 'Pública' : 'Privada'}
                </span>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-4 mt-2 mb-3 text-[12px] text-ink3">
                <span>{g.artCount} obras</span>
                <span className="w-px h-3 bg-(--border)" />
                {g.visibility === 'public'
                  ? <span>{g.visits.toLocaleString()} visitas este mes</span>
                  : <span>Galería privada</span>
                }
                <span className="w-px h-3 bg-(--border)" />
                <span>Act. {g.updatedAt}</span>
              </div>

              {/* Progress bar */}
              <div className="h-0.75 bg-(--border) rounded-sm overflow-hidden">
                <div
                  className="h-full rounded-sm transition-all duration-1000 ease-[cubic-bezier(.22,1,.36,1)]"
                  style={{
                    width:      `${(g.artCount / g.maxArts) * 100}%`,
                    background: BAR_COLOR[g.visibility],
                  }}
                />
              </div>
              <div className="text-[11px] text-ink3 mt-1.5">
                {g.artCount} / {g.maxArts} obras · {g.maxArts - g.artCount} slots libres
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-1.5 px-5 pb-4 pt-3 border-t border-(--border)">
              <Link
                href={`/dashboard/artworks?gallery=${g.slug}`}
                className="text-[12px] px-4 py-1.75 border border-(--border) rounded-xs text-ink3 no-underline hover:border-(--border-md) hover:text-ink transition-all"
              >
                Gestionar obras
              </Link>
              <button className="text-[12px] px-4 py-1.75 border border-(--border) rounded-xs text-ink3 bg-transparent hover:border-(--border-md) hover:text-ink transition-all">
                Editar
              </button>
              <button
                onClick={() => toggleVisibility(g.id)}
                className={`ml-auto text-[12px] px-4 py-1.75 border rounded-xs transition-all ${
                  g.visibility === 'public'
                    ? 'border-(--border) text-ink3 hover:border-(--border-md) hover:text-ink'
                    : 'border-gold text-gold bg-(--gold-dim) hover:bg-[oklch(60%_0.130_82/0.18)]'
                }`}
              >
                {g.visibility === 'public' ? 'Privatizar' : 'Publicar'}
              </button>
            </div>
          </div>
        ))}

        {/* New gallery slot */}
        <Link
          href="/dashboard/galleries/new"
          className="border-2 border-dashed border-(--border) flex flex-col items-center justify-center gap-2 text-ink3 hover:border-gold hover:text-gold transition-colors min-h-80 no-underline reveal rd2"
        >
          <span className="text-[28px] opacity-30">+</span>
          <span className="text-[13px]">Nueva galería</span>
          <span className="text-[11px] opacity-60">1 slot disponible en tu plan</span>
        </Link>
      </div>
    </div>
  )
}
