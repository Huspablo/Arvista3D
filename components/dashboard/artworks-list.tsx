'use client'

import { useState } from 'react'
import Link from 'next/link'

type ArtworkType = 'pintura' | 'escultura' | 'fotografia' | 'otro'

interface Artwork {
  id:      string
  title:   string
  type:    ArtworkType
  gallery: string | null
  status:  'exposed' | 'draft'
  art:     string
  year:    number
  dims:    string
}

const ARTWORKS: Artwork[] = [
  { id: '1',  title: 'Espiral #3',     type: 'escultura',  gallery: 'Texturas urbanas', status: 'exposed', art: 'art-p1',  year: 2024, dims: '40 × 60 × 30 cm' },
  { id: '2',  title: 'Bruma I',        type: 'fotografia', gallery: 'Texturas urbanas', status: 'exposed', art: 'art-p2',  year: 2023, dims: '90 × 60 cm' },
  { id: '3',  title: 'Agua & Luz',     type: 'otro',       gallery: 'Agua & Forma',     status: 'exposed', art: 'art-p3',  year: 2023, dims: '200 × 150 × 60 cm' },
  { id: '4',  title: 'Raíz doble',     type: 'pintura',    gallery: 'Agua & Forma',     status: 'exposed', art: 'art-p4',  year: 2024, dims: '120 × 100 cm' },
  { id: '5',  title: 'Vacío útil',     type: 'otro',       gallery: 'Texturas urbanas', status: 'exposed', art: 'art-p5',  year: 2023, dims: '— (vídeo 4K, 8 min)' },
  { id: '6',  title: 'Textura #7',     type: 'escultura',  gallery: 'Texturas urbanas', status: 'exposed', art: 'art-p6',  year: 2024, dims: '35 × 35 × 90 cm' },
  { id: '7',  title: 'Luz baja',       type: 'fotografia', gallery: 'Texturas urbanas', status: 'exposed', art: 'art-p7',  year: 2023, dims: '60 × 90 cm' },
  { id: '8',  title: 'Forma libre',    type: 'pintura',    gallery: 'Agua & Forma',     status: 'exposed', art: 'art-p8',  year: 2022, dims: '140 × 110 cm' },
  { id: '9',  title: 'Equilibrio',     type: 'escultura',  gallery: null,               status: 'draft',   art: 'art-p9',  year: 2024, dims: '30 × 30 × 80 cm' },
  { id: '10', title: 'Sin título IV',  type: 'pintura',    gallery: null,               status: 'draft',   art: 'art-p10', year: 2024, dims: '50 × 70 cm' },
]

const TYPE_LABEL: Record<ArtworkType, string> = {
  pintura: 'Pintura', escultura: 'Escultura', fotografia: 'Fotografía', otro: 'Otro',
}
const TYPE_FILTERS   = ['Todas', 'Pintura', 'Escultura', 'Fotografía', 'Otro']
const STATUS_FILTERS = ['Todas', 'Expuestas', 'Sin exponer']
const TYPE_MAP: Record<string, ArtworkType> = {
  Pintura: 'pintura', Escultura: 'escultura', Fotografía: 'fotografia', Otro: 'otro',
}

export function ArtworksList() {
  const [typeFilter,   setTypeFilter]   = useState('Todas')
  const [statusFilter, setStatusFilter] = useState('Todas')
  const [search,       setSearch]       = useState('')

  const filtered = ARTWORKS.filter(a => {
    if (typeFilter !== 'Todas' && a.type !== TYPE_MAP[typeFilter]) return false
    if (statusFilter === 'Expuestas'   && a.status !== 'exposed') return false
    if (statusFilter === 'Sin exponer' && a.status !== 'draft')   return false
    if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <>
      {/* Filter bar */}
      <div className="px-12 py-3 flex items-center gap-4 flex-wrap border-b border-(--border) bg-bg2 sticky top-16 z-10 max-md:px-6">
        <div className="flex gap-1.5 flex-wrap">
          {TYPE_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={`text-[12px] px-3.5 py-1.5 border rounded-[20px] transition-all ${
                typeFilter === f
                  ? 'border-gold text-gold bg-(--gold-dim)'
                  : 'border-(--border) text-ink3 hover:border-(--border-md) hover:text-ink'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-(--border) max-md:hidden" />

        <div className="flex gap-1.5">
          {STATUS_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`text-[12px] px-3.5 py-1.5 border rounded-[20px] transition-all ${
                statusFilter === f
                  ? 'border-gold text-gold bg-(--gold-dim)'
                  : 'border-(--border) text-ink3 hover:border-(--border-md) hover:text-ink'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2 border border-(--border) rounded-xs px-3 py-1.75 bg-bg3 focus-within:border-(--border-md) transition-colors">
          <span className="text-ink3 text-[15px] leading-none select-none">⌕</span>
          <input
            type="text"
            placeholder="Buscar obras…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-[13px] text-ink placeholder:text-ink3 w-40"
          />
        </div>
      </div>

      {/* Count row */}
      <div className="px-12 pt-5 pb-3 max-md:px-6">
        <span className="text-[13px] text-ink3">
          {filtered.length} obra{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Grid */}
      <div
        className="px-12 pb-16 grid gap-px bg-(--border) max-md:px-0"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
      >
        {filtered.map((a, i) => (
          <div
            key={a.id}
            className={`bg-bg flex flex-col group reveal ${i > 0 && i < 4 ? `rd${i}` : ''}`}
          >
            {/* Thumbnail */}
            <div className="relative h-40 overflow-hidden">
              <div
                className={`w-full h-full ${a.art} transition-transform duration-600 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04]`}
              />
              <span
                className={`absolute top-3 right-3 text-[9px] tracking-[1.5px] uppercase px-2 py-0.75 rounded-[1px] font-medium border ${
                  a.status === 'exposed'
                    ? 'bg-(--ok-dim) text-ok border-[oklch(56%_0.14_155/0.2)]'
                    : 'bg-bg text-ink3 border-(--border-md)'
                }`}
              >
                {a.status === 'exposed' ? 'Expuesta' : 'Sin exponer'}
              </span>
            </div>

            {/* Body */}
            <div className="px-5 pt-4 pb-2 flex-1">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className="font-serif text-[17px] font-bold leading-tight">{a.title}</span>
                <span className="text-[11px] text-ink3 shrink-0 mt-0.75">{a.year}</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] tracking-[1.5px] uppercase text-ink3">
                  {TYPE_LABEL[a.type]}
                </span>
                {a.gallery && (
                  <>
                    <span className="text-(--border-md) text-[11px]">·</span>
                    <span className="text-[11px] text-ink3">{a.gallery}</span>
                  </>
                )}
              </div>
              <div className="text-[12px] text-ink3 mt-1">{a.dims}</div>
            </div>

            {/* Actions */}
            <div className="flex gap-1.5 px-5 py-3 border-t border-(--border)">
              <button className="text-[12px] px-4 py-1.75 border border-(--border) rounded-xs text-ink3 bg-transparent hover:border-(--border-md) hover:text-ink transition-all">
                Editar
              </button>
              <button
                className={`text-[12px] px-4 py-1.75 border rounded-xs transition-all ${
                  a.status === 'exposed'
                    ? 'border-(--border) text-ink3 hover:border-(--border-md) hover:text-ink'
                    : 'border-gold text-gold bg-(--gold-dim) hover:bg-[oklch(60%_0.130_82/0.18)]'
                }`}
              >
                {a.status === 'exposed' ? 'Retirar' : 'Exponer'}
              </button>
              <Link
                href={`/artworks/${a.id}`}
                className="ml-auto text-[12px] px-3 py-1.75 border border-(--border) rounded-xs text-ink3 no-underline hover:border-(--border-md) hover:text-ink transition-all"
              >
                Ver →
              </Link>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full bg-bg flex flex-col items-center justify-center py-20 gap-3 text-ink3">
            <span className="text-[32px] opacity-20">◇</span>
            <span className="text-[14px]">No hay obras que coincidan</span>
          </div>
        )}
      </div>
    </>
  )
}
