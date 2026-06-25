'use client'

import { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { ArtworkType } from '@prisma/client'
import { TYPE_LABEL } from '@/lib/labels'
import { FrameCorners } from '@/components/ui/frame-corners'

interface PublicArtwork {
  id:            string
  title:         string
  type:          ArtworkType
  year:          number | null
  assetThumbnail: string | null
  artist:        { id: string; name: string }
  slot:          { gallery: { id: string; name: string; slug: string } } | null
}

const FILTERS = ['Todas', 'Pintura', 'Escultura', 'Fotografía', 'Otro'] as const
const TYPE_MAP: Record<string, ArtworkType> = {
  Pintura: 'PAINTING', Escultura: 'SCULPTURE', Fotografía: 'PHOTOGRAPHY', Otro: 'OTHER',
}
const SORTS = ['Más recientes', 'Más antiguas', 'A–Z', 'Z–A'] as const

// Rotate aspect ratios so the masonry has visual rhythm
const ASPECT_CYCLE = ['aspect-4/3', 'aspect-3/4', 'aspect-4/3', 'aspect-square', 'aspect-3/4', 'aspect-4/3']

export function ObrasCatalog() {
  const [artworks,  setArtworks]  = useState<PublicArtwork[]>([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [filter,    setFilter]    = useState('Todas')
  const [sort,      setSort]      = useState('Más recientes')
  const [search,    setSearch]    = useState('')

  const load = () => {
    setLoading(true)
    setError('')
    fetch('/api/artworks/public')
      .then(r => { if (!r.ok) throw new Error('Error del servidor'); return r.json() })
      .then(data => { setArtworks(data); setLoading(false) })
      .catch(() => { setError('No se pudieron cargar las obras. Comprueba tu conexión.'); setLoading(false) })
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    let list = artworks.filter(a => {
      if (filter !== 'Todas' && a.type !== TYPE_MAP[filter]) return false
      if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
    if (sort === 'Más recientes') list = [...list].sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
    if (sort === 'Más antiguas')  list = [...list].sort((a, b) => (a.year ?? 0) - (b.year ?? 0))
    if (sort === 'A–Z')           list = [...list].sort((a, b) => a.title.localeCompare(b.title))
    if (sort === 'Z–A')           list = [...list].sort((a, b) => b.title.localeCompare(a.title))
    return list
  }, [artworks, filter, sort, search])

  return (
    <>
      {/* Cabecera */}
      <div className="px-15 pt-10 pb-10 border-b border-(--border) max-md:px-6 max-md:pt-8">
        <span className="text-[11px] tracking-[5px] uppercase text-gold mb-3 block reveal">Catálogo</span>
        <div className="flex items-end justify-between gap-6 max-md:flex-col max-md:items-start">
          <h1 className="font-serif font-black leading-[.92] reveal rd1" style={{ fontSize: 'clamp(48px, 7vw, 96px)' }}>
            Obras <em className="italic text-gold">expuestas</em>
          </h1>
          <p className="text-[14px] text-ink3 mb-1 reveal rd2">
            {loading ? '…' : `${filtered.length} obra${filtered.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* Barra de filtros */}
      <div className="px-15 py-3 flex items-center gap-4 flex-wrap border-b border-(--border) bg-bg2 sticky top-14.25 z-20 max-md:px-6">
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-[12px] px-3.5 py-1.5 border rounded-xs transition-all ${
                filter === f ? 'border-gold text-gold bg-(--gold-dim)' : 'border-(--border) text-ink3 hover:border-(--border-md) hover:text-ink'
              }`}>
              {f}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2 border border-(--border) rounded-xs px-3 py-1.75 bg-bg3 focus-within:border-(--border-md) transition-colors">
            <span className="text-ink3 text-[15px] leading-none select-none">⌕</span>
            <input type="text" placeholder="Buscar…" value={search} onChange={e => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-[13px] text-ink placeholder:text-ink3 w-32.5" />
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
              <span className="text-[14px]">No hay obras que coincidan</span>
              <button onClick={() => { setFilter('Todas'); setSearch('') }}
                className="text-[12px] text-gold border-b border-gold mt-1">
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-5">
              {filtered.map((a, i) => {
                const aspect = ASPECT_CYCLE[i % ASPECT_CYCLE.length]
                return (
                  <div
                    key={a.id}
                    className={`break-inside-avoid mb-5 bg-bg group reveal relative transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_16px_48px_oklch(0%_0_0/0.12)] ${i > 0 && i < 4 ? `rd${i}` : ''}`}
                    style={{ boxShadow: '0 2px 8px oklch(0% 0 0 / 0.06)' }}
                  >
                    {/* Cover link */}
                    <Link href={`/artworks/${a.id}`} className="absolute inset-0 z-1" aria-label={a.title} />

                    {/* Framed image */}
                    <div className="p-2.5" style={{ background: 'oklch(13% 0.010 75)' }}>
                      <div className={`relative overflow-hidden ${aspect}`}>
                        {a.assetThumbnail ? (
                          <Image
                            src={a.assetThumbnail}
                            alt={a.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ background: 'oklch(18% 0.010 75)' }}>
                            <span className="font-serif text-[48px] opacity-10 text-[oklch(80%_0.05_75)]">◇</span>
                          </div>
                        )}

                        {/* Hover overlay */}
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-350 flex flex-col justify-end p-4 z-20"
                          style={{ background: 'linear-gradient(to top, oklch(10% 0.010 75 / .85) 0%, transparent 55%)' }}
                        >
                          <span className="text-[11px] tracking-[3px] uppercase text-gold font-medium">Ver obra →</span>
                        </div>

                        {/* Frame corner ornaments */}
                        <FrameCorners size={28} opacity={0.7} />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="px-4 py-4 relative z-2">
                      <h3 className="font-serif text-[17px] font-bold leading-tight mb-1.5">{a.title}</h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-ink3 flex-wrap">
                        <span className="tracking-[1.5px] uppercase">{TYPE_LABEL[a.type]}</span>
                        <span className="text-(--border-md)">·</span>
                        <Link
                          href={`/artists/${a.artist.id}`}
                          className="text-ink3 hover:text-ink transition-colors border-b border-transparent hover:border-(--border-md) z-2 relative"
                        >
                          {a.artist.name}
                        </Link>
                        {a.year && <><span className="text-(--border-md)">·</span><span>{a.year}</span></>}
                      </div>
                      {a.slot?.gallery && (
                        <div className="mt-3">
                          <span className="text-[10px] tracking-[0.8px] text-gold border border-[oklch(60%_0.130_82/0.25)] px-1.5 py-0.5 rounded-xs">
                            ◇ {a.slot.gallery.name}
                          </span>
                        </div>
                      )}
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
