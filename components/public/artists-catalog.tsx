'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { ArtistAvatar } from '@/components/ui/artist-avatar'

interface PublicArtist {
  id:             string
  name:           string
  bio:            string | null
  avatarUrl:      string | null
  website:        string | null
  createdAt:      string
  galleryCount:   number
  artworkCount:   number
  primaryGallery: { slug: string; name: string } | null
}

const SORTS = ['Más activos', 'A–Z', 'Z–A'] as const

export function ArtistsCatalog() {
  const [artists,  setArtists]  = useState<PublicArtist[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [sort,     setSort]     = useState<typeof SORTS[number]>('Más activos')
  const [search,   setSearch]   = useState('')

  const load = () => {
    setLoading(true)
    setError('')
    fetch('/api/artists/public')
      .then(r => { if (!r.ok) throw new Error('Error del servidor'); return r.json() })
      .then(data => { setArtists(data); setLoading(false) })
      .catch(() => { setError('No se pudieron cargar los artistas. Comprueba tu conexión.'); setLoading(false) })
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    let list = artists.filter(a => {
      if (!q) return true
      return a.name.toLowerCase().includes(q) || a.bio?.toLowerCase().includes(q)
    })
    if (sort === 'Más activos') list = [...list].sort((a, b) => b.artworkCount - a.artworkCount)
    if (sort === 'A–Z')         list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    if (sort === 'Z–A')         list = [...list].sort((a, b) => b.name.localeCompare(a.name))
    return list
  }, [artists, sort, search])

  return (
    <>
      {/* Cabecera */}
      <div className="px-15 pt-10 pb-10 border-b border-(--border) max-md:px-6 max-md:pt-8">
        <span className="text-[11px] tracking-[5px] uppercase text-gold mb-3 block reveal">Comunidad</span>
        <div className="flex items-end justify-between gap-6 max-md:flex-col max-md:items-start">
          <h1 className="font-serif font-black leading-[.92] reveal rd1" style={{ fontSize: 'clamp(48px, 7vw, 96px)' }}>
            Artistas <em className="italic text-gold">en Arvista</em>
          </h1>
          <p className="text-[14px] text-ink3 mb-1 reveal rd2">
            {loading ? '…' : `${filtered.length} artista${filtered.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* Barra de búsqueda y orden */}
      <div className="px-15 py-3 flex items-center gap-4 flex-wrap border-b border-(--border) bg-bg2 sticky top-14.25 z-20 max-md:px-6">
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2 border border-(--border) rounded-xs px-3 py-1.75 bg-bg3 focus-within:border-(--border-md) transition-colors">
            <span className="text-ink3 text-[15px] leading-none select-none">⌕</span>
            <input
              type="text"
              placeholder="Nombre o disciplina…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-[13px] text-ink placeholder:text-ink3 w-44"
            />
          </div>
          <div className="relative">
            <select value={sort} onChange={e => setSort(e.target.value as typeof SORTS[number])}
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

      {/* Grid con tarjetas de artista */}
      {!error && (
        <div className="px-10 py-10 max-md:px-4 max-md:py-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-bg border border-(--border) px-7 py-8 flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-bg3 animate-pulse shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-bg3 rounded-xs animate-pulse w-2/3" />
                      <div className="h-3 bg-bg3 rounded-xs animate-pulse w-1/3" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-bg3 rounded-xs animate-pulse w-full" />
                    <div className="h-3 bg-bg3 rounded-xs animate-pulse w-4/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 gap-3 text-ink3">
              <span className="text-[48px] opacity-10 font-serif">◇</span>
              <span className="text-[14px]">No hay artistas que coincidan</span>
              <button onClick={() => setSearch('')}
                className="text-[12px] text-gold border-b border-gold mt-1">
                Limpiar búsqueda
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
              {filtered.map((a, i) => (
                <div
                  key={a.id}
                  className={`bg-bg flex flex-col group reveal relative transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_16px_48px_oklch(0%_0_0/0.12)] ${i > 0 && i < 4 ? `rd${i}` : ''}`}
                  style={{ boxShadow: '0 2px 8px oklch(0% 0 0 / 0.06)' }}
                >
                  <Link href={`/artists/${a.id}`} className="absolute inset-0 z-1" aria-label={`Ver perfil de ${a.name}`} />

                  {/* Avatar con marco oscuro */}
                  <div className="px-7 pt-8 pb-5 flex items-start gap-5">
                    <div className="relative shrink-0">
                      <div className="p-1.5 rounded-full" style={{ background: 'oklch(13% 0.010 75)' }}>
                        <div className="w-16 h-16 rounded-full overflow-hidden ring-1 ring-[oklch(65%_0.130_82/0.45)] group-hover:ring-[oklch(65%_0.130_82/0.9)] transition-all duration-500">
                          <ArtistAvatar url={a.avatarUrl} name={a.name} size={64} />
                        </div>
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px]"
                        style={{ background: 'oklch(13% 0.010 75)', color: 'oklch(65% 0.130 82)', border: '1px solid oklch(65% 0.130 82 / 0.4)' }}>
                        ◆
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5 min-w-0 pt-1">
                      <h3 className="font-serif text-[20px] font-bold leading-tight group-hover:text-gold transition-colors duration-300">
                        {a.name}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-ink3">
                        <span>{a.artworkCount} obra{a.artworkCount !== 1 ? 's' : ''}</span>
                        <span className="text-(--border-md)">·</span>
                        <span>{a.galleryCount} galería{a.galleryCount !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  {a.bio && (
                    <p className="px-7 pb-5 text-[13px] text-ink3 leading-relaxed line-clamp-3 border-b border-(--border)">
                      {a.bio}
                    </p>
                  )}

                  {/* Footer */}
                  <div className="px-7 py-4 flex items-center justify-between mt-auto relative z-2">
                    {a.primaryGallery ? (
                      <Link
                        href={`/galleries/${a.primaryGallery.slug}`}
                        className="text-[11px] tracking-[0.8px] text-gold border border-[oklch(60%_0.130_82/0.25)] px-2 py-1 rounded-xs hover:bg-(--gold-dim) transition-colors"
                      >
                        ◇ {a.primaryGallery.name}
                      </Link>
                    ) : (
                      <span />
                    )}
                    <span className="text-[12px] text-ink3 group-hover:text-gold transition-colors duration-300 shrink-0">
                      Ver perfil →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
