'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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

// Ordenar por obras (los más activos primero), no por fecha de registro
const SORTS = ['Más activos', 'A–Z', 'Z–A'] as const

export function ArtistsCatalog() {
  const router = useRouter()
  const [artists,  setArtists]  = useState<PublicArtist[]>([])
  const [loading,  setLoading]  = useState(true)
  const [sort,     setSort]     = useState<typeof SORTS[number]>('Más activos')
  const [search,   setSearch]   = useState('')

  useEffect(() => {
    fetch('/api/artists/public')
      .then(r => r.json())
      .then(data => { setArtists(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    let list = artists.filter(a => {
      if (!q) return true
      // Busca en nombre Y en bio
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

      {/* Grid */}
      <div className="px-15 py-10 grid gap-px bg-(--border) max-md:px-0"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {loading
          ? [1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-bg px-6 py-7 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-bg2 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-bg2 rounded animate-pulse w-2/3" />
                    <div className="h-3 bg-bg2 rounded animate-pulse w-1/3" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-bg2 rounded animate-pulse w-full" />
                  <div className="h-3 bg-bg2 rounded animate-pulse w-4/5" />
                  <div className="h-3 bg-bg2 rounded animate-pulse w-3/5" />
                </div>
              </div>
            ))
          : filtered.map((a, i) => (
              <Link
                key={a.id}
                href={`/artists/${a.id}`}
                className={`bg-bg no-underline flex flex-col group reveal ${i > 0 && i < 4 ? `rd${i}` : ''}`}
              >
                {/* Avatar + nombre + stats */}
                <div className="px-6 pt-7 pb-5 flex items-start gap-4">
                  {a.avatarUrl ? (
                    <img src={a.avatarUrl} alt={a.name} // eslint-disable-line
                      className="w-14 h-14 rounded-full object-cover shrink-0 transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div
                      className="w-14 h-14 rounded-full shrink-0 flex items-center justify-center font-serif font-bold text-[20px]"
                      style={{
                        background: 'radial-gradient(ellipse at 25% 75%, oklch(68% .10 300), oklch(84% .14 82))',
                        color:      'oklch(94% 0.008 75)',
                      }}
                    >
                      {a.name[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col gap-1 min-w-0">
                    <h3 className="font-serif text-[19px] font-bold leading-tight group-hover:text-gold transition-colors">
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
                  <p className="px-6 pb-5 text-[13px] text-ink3 leading-relaxed line-clamp-3 border-b border-(--border)">
                    {a.bio}
                  </p>
                )}

                {/* Footer: galería + acción */}
                <div className="px-6 py-4 flex items-center justify-between mt-auto">
                  {a.primaryGallery ? (
                    <span
                      onClick={e => { e.preventDefault(); e.stopPropagation(); router.push(`/galleries/${a.primaryGallery!.slug}`) }}
                      className="cursor-pointer text-[11px] tracking-[0.8px] text-gold border border-[oklch(60%_0.130_82/0.25)] px-2 py-1 rounded-xs hover:bg-(--gold-dim) transition-colors"
                    >
                      ◇ {a.primaryGallery.name}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span className="text-[12px] text-ink3 group-hover:text-gold transition-colors shrink-0">
                    Ver perfil →
                  </span>
                </div>
              </Link>
            ))
        }

        {!loading && filtered.length === 0 && (
          <div className="col-span-full bg-bg flex flex-col items-center justify-center py-24 gap-3 text-ink3">
            <span className="text-[40px] opacity-15">◇</span>
            <span className="text-[14px]">No hay artistas que coincidan</span>
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
