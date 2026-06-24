'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'

interface PublicGallery {
  id:            string
  name:          string
  description:   string | null
  slug:          string
  createdAt:     string
  artist:        { id: string; name: string; avatarUrl: string | null }
  exposedCount:  number
  previewImages: string[]
}

const SORTS = ['Más recientes', 'Más antiguas', 'A–Z', 'Z–A'] as const

export function GalleriesCatalog() {
  const [galleries, setGalleries] = useState<PublicGallery[]>([])
  const [loading,   setLoading]   = useState(true)
  const [sort,      setSort]      = useState('Más recientes')
  const [search,    setSearch]    = useState('')

  useEffect(() => {
    fetch('/api/galleries/public')
      .then(r => r.json())
      .then(data => { setGalleries(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let list = galleries.filter(g => {
      if (search && !g.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
    if (sort === 'Más recientes') list = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    if (sort === 'Más antiguas')  list = [...list].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    if (sort === 'A–Z')           list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    if (sort === 'Z–A')           list = [...list].sort((a, b) => b.name.localeCompare(a.name))
    return list
  }, [galleries, sort, search])

  return (
    <>
      {/* Cabecera */}
      <div className="px-15 pt-10 pb-10 border-b border-(--border) max-md:px-6 max-md:pt-8">
        <span className="text-[11px] tracking-[5px] uppercase text-gold mb-3 block reveal">Exposiciones</span>
        <div className="flex items-end justify-between gap-6 max-md:flex-col max-md:items-start">
          <h1 className="font-serif font-black leading-[.92] reveal rd1" style={{ fontSize: 'clamp(48px, 7vw, 96px)' }}>
            Galerías <em className="italic text-gold">virtuales</em>
          </h1>
          <p className="text-[14px] text-ink3 mb-1 reveal rd2">
            {loading ? '…' : `${filtered.length} galería${filtered.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* Barra de búsqueda y orden */}
      <div className="px-15 py-3 flex items-center gap-4 flex-wrap border-b border-(--border) bg-bg2 sticky top-14.25 z-20 max-md:px-6">
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2 border border-(--border) rounded-xs px-3 py-1.75 bg-bg3 focus-within:border-(--border-md) transition-colors">
            <span className="text-ink3 text-[15px] leading-none select-none">⌕</span>
            <input type="text" placeholder="Buscar galería…" value={search} onChange={e => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-[13px] text-ink placeholder:text-ink3 w-38" />
          </div>
          <div className="relative">
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="appearance-none border border-(--border) bg-bg text-ink text-[13px] px-4 pr-8 py-1.75 rounded-xs outline-none focus:border-(--border-md) cursor-pointer transition-colors">
              {SORTS.map(s => <option key={s}>{s}</option>)}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink3 pointer-events-none text-[11px]">▾</span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="px-15 py-10 grid gap-px bg-(--border) max-md:px-0"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
        {loading
          ? [1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-bg">
                <div className="w-full bg-bg2 animate-pulse" style={{ aspectRatio: '3/2' }} />
                <div className="px-5 py-5 border-t border-(--border) space-y-2.5">
                  <div className="h-5 bg-bg2 rounded animate-pulse w-2/3" />
                  <div className="h-3 bg-bg2 rounded animate-pulse w-1/2" />
                  <div className="h-3 bg-bg2 rounded animate-pulse w-1/3" />
                </div>
              </div>
            ))
          : filtered.map((g, i) => (
              <Link key={g.id} href={`/galleries/${g.slug}`}
                className={`bg-bg no-underline flex flex-col group reveal ${i > 0 && i < 4 ? `rd${i}` : ''}`}>
                {/* Preview mosaico */}
                <div className="relative overflow-hidden" style={{ aspectRatio: '3/2' }}>
                  {g.previewImages.length > 0 ? (
                    <div className={`w-full h-full grid gap-px ${g.previewImages.length >= 3 ? 'grid-cols-3' : g.previewImages.length === 2 ? 'grid-cols-2' : ''}`}>
                      {(g.previewImages.length >= 3 ? g.previewImages.slice(0, 3) : g.previewImages).map((src, idx) => (
                        <img key={idx} src={src} alt="" // eslint-disable-line
                          className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04]" />
                      ))}
                    </div>
                  ) : (
                    <div className="w-full h-full bg-bg2 flex items-center justify-center">
                      <span className="font-serif text-[48px] opacity-10">◇</span>
                    </div>
                  )}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-350 flex flex-col justify-end p-5"
                    style={{ background: 'linear-gradient(to top, oklch(97.5% 0.007 75 / .92) 0%, transparent 55%)' }}>
                    <span className="inline-flex items-center gap-2 text-[12px] tracking-[2px] uppercase text-gold font-medium">Visitar galería →</span>
                  </div>
                </div>

                {/* Info */}
                <div className="px-5 py-5 border-t border-(--border) flex-1 flex flex-col gap-2">
                  <h3 className="font-serif text-[20px] font-bold leading-tight">{g.name}</h3>
                  {g.description && (
                    <p className="text-[13px] text-ink3 leading-snug line-clamp-2">{g.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-auto pt-2 border-t border-(--border)">
                    {g.artist.avatarUrl ? (
                      <img src={g.artist.avatarUrl} alt={g.artist.name} // eslint-disable-line
                        className="w-6 h-6 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-bg3 flex items-center justify-center shrink-0">
                        <span className="text-[10px] text-ink3">{g.artist.name[0]?.toUpperCase()}</span>
                      </div>
                    )}
                    <span className="text-[12px] text-ink3">{g.artist.name}</span>
                    <span className="ml-auto text-[11px] text-ink3">{g.exposedCount} obra{g.exposedCount !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </Link>
            ))
        }

        {!loading && filtered.length === 0 && (
          <div className="col-span-full bg-bg flex flex-col items-center justify-center py-24 gap-3 text-ink3">
            <span className="text-[40px] opacity-15">◇</span>
            <span className="text-[14px]">No hay galerías que coincidan</span>
            <button onClick={() => setSearch('')}
              className="text-[12px] text-gold border-b border-gold mt-1">
              Limpiar búsqueda
            </button>
          </div>
        )}
      </div>
    </>
  )
}
