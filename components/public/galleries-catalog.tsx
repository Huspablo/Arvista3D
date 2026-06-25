'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { ArtistAvatar } from '@/components/ui/artist-avatar'
import { GalleryPreviewMosaic } from '@/components/ui/gallery-preview-mosaic'
import { FrameCorners } from '@/components/ui/frame-corners'

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

const ASPECT_CYCLE = ['aspect-4/3', 'aspect-3/2', 'aspect-4/3', 'aspect-square', 'aspect-3/2', 'aspect-4/3']

export function GalleriesCatalog() {
  const [galleries, setGalleries] = useState<PublicGallery[]>([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [sort,      setSort]      = useState('Más recientes')
  const [search,    setSearch]    = useState('')

  const load = () => {
    setLoading(true)
    setError('')
    fetch('/api/galleries/public')
      .then(r => { if (!r.ok) throw new Error('Error del servidor'); return r.json() })
      .then(data => { setGalleries(data); setLoading(false) })
      .catch(() => { setError('No se pudieron cargar las galerías. Comprueba tu conexión.'); setLoading(false) })
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

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

      {/* Error */}
      {error && (
        <div className="px-15 py-16 flex flex-col items-center gap-4 text-center max-md:px-6">
          <span className="text-[13px] text-ink3">{error}</span>
          <button onClick={load} className="text-[12px] text-gold border-b border-gold">Reintentar</button>
        </div>
      )}

      {/* Masonry */}
      {!error && (
        <div className="px-10 py-10 max-md:px-4 max-md:py-6">
          {loading ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-5">
              {[1,2,3,4,5,6].map((i) => (
                <div key={i} className={`break-inside-avoid mb-5 bg-bg border border-(--border) overflow-hidden ${ASPECT_CYCLE[i % ASPECT_CYCLE.length]}`}>
                  <div className="w-full h-full bg-bg3 animate-pulse" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 gap-3 text-ink3">
              <span className="text-[48px] opacity-10 font-serif">◇</span>
              <span className="text-[14px]">No hay galerías que coincidan</span>
              <button onClick={() => setSearch('')}
                className="text-[12px] text-gold border-b border-gold mt-1">
                Limpiar búsqueda
              </button>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-5">
              {filtered.map((g, i) => {
                const aspect = ASPECT_CYCLE[i % ASPECT_CYCLE.length]
                return (
                  <div
                    key={g.id}
                    className={`break-inside-avoid mb-5 bg-bg group reveal relative transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_16px_48px_oklch(0%_0_0/0.12)] ${i > 0 && i < 4 ? `rd${i}` : ''}`}
                    style={{ boxShadow: '0 2px 8px oklch(0% 0 0 / 0.06)' }}
                  >
                    <Link href={`/galleries/${g.slug}`} className="absolute inset-0 z-1" aria-label={g.name} />

                    {/* Framed mosaic */}
                    <div className="p-2.5" style={{ background: 'oklch(13% 0.010 75)' }}>
                      <div className={`relative overflow-hidden ${aspect}`}>
                        <GalleryPreviewMosaic images={g.previewImages} />
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-350 flex flex-col justify-end p-4 z-20"
                          style={{ background: 'linear-gradient(to top, oklch(10% 0.010 75 / .85) 0%, transparent 55%)' }}
                        >
                          <span className="text-[11px] tracking-[3px] uppercase text-gold font-medium">Visitar galería →</span>
                        </div>
                        <FrameCorners size={28} opacity={0.65} />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="px-5 py-5 relative z-2 flex flex-col gap-2">
                      <h3 className="font-serif text-[19px] font-bold leading-tight">{g.name}</h3>
                      {g.description && (
                        <p className="text-[13px] text-ink3 leading-snug line-clamp-2">{g.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2 pt-3 border-t border-(--border)">
                        <div className="w-6 h-6 rounded-full shrink-0 overflow-hidden">
                          <ArtistAvatar url={g.artist.avatarUrl} name={g.artist.name} size={24} />
                        </div>
                        <span className="text-[12px] text-ink3">{g.artist.name}</span>
                        <span className="ml-auto text-[11px] text-ink3 shrink-0">{g.exposedCount} obra{g.exposedCount !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </>
  )
}
