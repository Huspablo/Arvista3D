'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

type ArtworkType = 'pintura' | 'escultura' | 'fotografia' | 'otro'

interface PublicArtwork {
  id:      string
  title:   string
  type:    ArtworkType
  artist:  string
  year:    number
  gallery: string
  slug:    string
  art:     string
}

const ARTWORKS: PublicArtwork[] = [
  { id: '1',  title: 'Espiral #3',     type: 'escultura',  artist: 'Mariana López', year: 2024, gallery: 'Texturas urbanas', slug: 'texturas-urbanas', art: 'art-p1'  },
  { id: '2',  title: 'Bruma I',        type: 'fotografia', artist: 'Mariana López', year: 2023, gallery: 'Texturas urbanas', slug: 'texturas-urbanas', art: 'art-p2'  },
  { id: '3',  title: 'Agua & Luz',     type: 'otro',       artist: 'Mariana López', year: 2023, gallery: 'Texturas urbanas', slug: 'texturas-urbanas', art: 'art-p3'  },
  { id: '4',  title: 'Raíz doble',     type: 'pintura',    artist: 'Mariana López', year: 2024, gallery: 'Texturas urbanas', slug: 'texturas-urbanas', art: 'art-p4'  },
  { id: '5',  title: 'Vacío útil',     type: 'otro',       artist: 'Mariana López', year: 2023, gallery: 'Texturas urbanas', slug: 'texturas-urbanas', art: 'art-p5'  },
  { id: '6',  title: 'Textura #7',     type: 'escultura',  artist: 'Mariana López', year: 2024, gallery: 'Texturas urbanas', slug: 'texturas-urbanas', art: 'art-p6'  },
  { id: '7',  title: 'Luz baja',       type: 'fotografia', artist: 'Mariana López', year: 2023, gallery: 'Texturas urbanas', slug: 'texturas-urbanas', art: 'art-p7'  },
  { id: '8',  title: 'Forma libre',    type: 'pintura',    artist: 'Mariana López', year: 2022, gallery: 'Texturas urbanas', slug: 'texturas-urbanas', art: 'art-p8'  },
]

const TYPE_LABEL: Record<ArtworkType, string> = {
  pintura: 'Pintura', escultura: 'Escultura', fotografia: 'Fotografía', otro: 'Otro',
}
const FILTERS   = ['Todas', 'Pintura', 'Escultura', 'Fotografía', 'Otro']
const TYPE_MAP: Record<string, ArtworkType> = {
  Pintura: 'pintura', Escultura: 'escultura', Fotografía: 'fotografia', Otro: 'otro',
}
const SORTS = ['Más recientes', 'Más antiguas', 'A–Z', 'Z–A']

export function ObrasCatalog() {
  const [filter, setFilter] = useState('Todas')
  const [sort,   setSort]   = useState('Más recientes')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    let list = ARTWORKS.filter(a => {
      if (filter !== 'Todas' && a.type !== TYPE_MAP[filter]) return false
      if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
    if (sort === 'Más recientes') list = [...list].sort((a, b) => b.year - a.year)
    if (sort === 'Más antiguas')  list = [...list].sort((a, b) => a.year - b.year)
    if (sort === 'A–Z')           list = [...list].sort((a, b) => a.title.localeCompare(b.title))
    if (sort === 'Z–A')           list = [...list].sort((a, b) => b.title.localeCompare(a.title))
    return list
  }, [filter, sort, search])

  return (
    <>
      {/* Page header */}
      <div className="px-15 pt-14 pb-10 border-b border-(--border) max-md:px-6 max-md:pt-10">
        <span className="text-[11px] tracking-[5px] uppercase text-gold mb-3 block reveal">
          Catálogo
        </span>
        <div className="flex items-end justify-between gap-6 max-md:flex-col max-md:items-start">
          <h1 className="font-serif font-black leading-[.92] reveal rd1" style={{ fontSize: 'clamp(48px, 7vw, 96px)' }}>
            Obras <em className="italic text-gold">expuestas</em>
          </h1>
          <p className="text-[14px] text-ink3 mb-1 reveal rd2">
            {filtered.length} obra{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div
        className="px-15 py-3 flex items-center gap-4 flex-wrap border-b border-(--border) bg-bg2 sticky top-0 z-10 max-md:px-6"
      >
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[12px] px-3.5 py-1.5 border rounded-[20px] transition-all ${
                filter === f
                  ? 'border-gold text-gold bg-(--gold-dim)'
                  : 'border-(--border) text-ink3 hover:border-(--border-md) hover:text-ink'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2 border border-(--border) rounded-xs px-3 py-1.75 bg-bg3 focus-within:border-(--border-md) transition-colors">
            <span className="text-ink3 text-[15px] leading-none select-none">⌕</span>
            <input
              type="text"
              placeholder="Buscar…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-[13px] text-ink placeholder:text-ink3 w-32.5"
            />
          </div>
          <div className="relative">
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="appearance-none border border-(--border) bg-bg text-ink text-[13px] px-4 pr-8 py-1.75 rounded-xs outline-none focus:border-(--border-md) cursor-pointer transition-colors"
            >
              {SORTS.map(s => <option key={s}>{s}</option>)}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink3 pointer-events-none text-[11px]">▾</span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div
        className="px-15 py-10 grid gap-px bg-(--border) max-md:px-0"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))' }}
      >
        {filtered.map((a, i) => (
          <Link
            key={a.id}
            href={`/artworks/${a.id}`}
            className={`bg-bg no-underline flex flex-col group reveal ${i > 0 && i < 4 ? `rd${i}` : ''}`}
          >
            {/* Thumbnail */}
            <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
              <div
                className={`w-full h-full ${a.art} transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.05]`}
              />
              {/* Hover overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-350 flex flex-col justify-end p-5"
                style={{ background: 'linear-gradient(to top, oklch(97.5% 0.007 75 / .92) 0%, transparent 55%)' }}
              >
                <span className="inline-flex items-center gap-2 text-[12px] tracking-[2px] uppercase text-gold font-medium">
                  Ver obra →
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="px-5 py-4 border-t border-(--border)">
              <h3 className="font-serif text-[18px] font-bold leading-tight mb-1">
                {a.title}
              </h3>
              <div className="flex items-center gap-1.5 text-[11px] text-ink3 flex-wrap">
                <span className="tracking-[1.5px] uppercase">{TYPE_LABEL[a.type]}</span>
                <span className="text-(--border-md)">·</span>
                <Link
                  href={`/galleries/${a.slug}`}
                  onClick={e => e.stopPropagation()}
                  className="text-ink3 no-underline hover:text-ink border-b border-transparent hover:border-(--border-md) transition-all"
                >
                  {a.artist}
                </Link>
                <span className="text-(--border-md)">·</span>
                <span>{a.year}</span>
              </div>
            </div>
          </Link>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full bg-bg flex flex-col items-center justify-center py-24 gap-3 text-ink3">
            <span className="text-[40px] opacity-15">◇</span>
            <span className="text-[14px]">No hay obras que coincidan</span>
            <button
              onClick={() => { setFilter('Todas'); setSearch('') }}
              className="text-[12px] text-gold border-b border-gold mt-1"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </>
  )
}
