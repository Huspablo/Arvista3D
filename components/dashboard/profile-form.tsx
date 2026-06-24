'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useUser, useClerk } from '@clerk/nextjs'
import { useArtist, useUpdateArtist } from '@/lib/hooks/use-artist'
import { useGalleries }               from '@/lib/hooks/use-galleries'
import { useArtworks }                from '@/lib/hooks/use-artworks'
import { PLAN_LIMITS }                from '@/lib/services/artist.service'

const PLAN_LABEL: Record<string, string> = {
  BASIC: 'Básico', STANDARD: 'Estándar', PREMIUM: 'Premium',
}

const PLAN_CHIP: Record<string, string> = {
  BASIC:    'border-(--border) text-ink3 bg-bg2',
  STANDARD: 'border-[oklch(56%_0.14_155/0.4)] text-ok bg-(--ok-dim)',
  PREMIUM:  'border-[oklch(60%_0.130_82/0.5)] text-gold bg-(--gold-dim)',
}

function CapacityBar({ used, max, label }: { used: number; max: number; label: string }) {
  const pct    = max === 0 ? 0 : Math.min(used / max, 1)
  const isHigh = pct >= 0.8
  return (
    <div>
      <div className="flex justify-between text-[11px] mb-1.5">
        <span className="text-ink3">{label}</span>
        <span className={isHigh ? 'text-warn font-medium' : 'text-ink3'}>{used} / {max}</span>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'oklch(100% 0 0 / .07)' }}>
        <div
          className={`h-full rounded-full transition-all duration-700 ${isHigh ? 'bg-warn' : 'bg-gold'}`}
          style={{ width: `${pct * 100}%` }}
        />
      </div>
    </div>
  )
}

export function ProfileForm() {
  const { user }                                = useUser()
  const { openUserProfile }                     = useClerk()
  const { data: artist, isLoading: artistLoad } = useArtist()
  const { data: galleries = [] }                = useGalleries()
  const { data: artworks  = [] }                = useArtworks()
  const updateArtist                            = useUpdateArtist()
  const avatarInputRef                          = useRef<HTMLInputElement>(null)

  const [displayName,     setDisplayName]     = useState('')
  const [bio,             setBio]             = useState('')
  const [website,         setWebsite]         = useState('')
  const [nameError,       setNameError]       = useState('')
  const [apiError,        setApiError]        = useState('')
  const [saved,           setSaved]           = useState(false)
  const [localAvatar,     setLocalAvatar]     = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError,     setAvatarError]     = useState('')
  const [urlCopied,       setUrlCopied]       = useState(false)

  useEffect(() => {
    if (artist) {
      setDisplayName(artist.name    ?? '')
      setBio        (artist.bio     ?? '')
      setWebsite    (artist.website ?? '')
    }
  }, [artist])

  const handleAvatarChange = async (file: File) => {
    if (!file.type.startsWith('image/')) return
    setAvatarError('')
    setAvatarUploading(true)
    const preview = URL.createObjectURL(file)
    setLocalAvatar(preview)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/assets/avatar-upload', { method: 'POST', body: formData })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { error?: string }).error ?? 'Error al subir la imagen')
      }
      const { cdnUrl } = await res.json() as { cdnUrl: string }
      await updateArtist.mutateAsync({ avatarUrl: cdnUrl })
    } catch (err) {
      setLocalAvatar(null)
      setAvatarError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setAvatarUploading(false)
      URL.revokeObjectURL(preview)
    }
  }

  const handleSubmit = (ev: { preventDefault(): void }) => {
    ev.preventDefault()
    if (!displayName.trim()) { setNameError('El nombre público es obligatorio'); return }
    setNameError('')
    setApiError('')
    updateArtist.mutate(
      { name: displayName.trim(), bio, website: website || undefined },
      {
        onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2500) },
        onError:   (err) => setApiError(err.message),
      },
    )
  }

  // ── Datos derivados ────────────────────────────────────────────────────────
  const initials        = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'
  const avatarSrc       = localAvatar ?? artist?.avatarUrl ?? null
  const memberSince     = artist
    ? new Date(artist.createdAt).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    : '—'
  const plan            = (artist?.plan ?? 'BASIC') as keyof typeof PLAN_LIMITS
  const limits          = PLAN_LIMITS[plan]
  const totalExposed    = artworks.filter(a => a.status === 'EXPOSED').length
  const totalViews      = artworks.reduce((sum, a) => sum + a.viewCount, 0)
  const firstPublicGal  = galleries.find(g => g.visibility === 'PUBLIC') ?? null
  const wallColor       = galleries.find(g => g.wallColor)?.wallColor ?? null

  // Gradiente del banner: calido-oscuro por defecto, con wallColor si existe
  const bannerBg = wallColor
    ? `linear-gradient(135deg, ${wallColor} 0%, oklch(11% 0.008 75) 70%)`
    : 'linear-gradient(135deg, oklch(18% 0.025 82) 0%, oklch(12% 0.01 75) 100%)'

  const publicUrl = firstPublicGal
    ? (typeof window !== 'undefined' ? window.location.origin : '') + `/galleries/${firstPublicGal.slug}`
    : null

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    }).catch(() => {})
  }

  if (artistLoad) {
    return (
      <>
        <div className="h-32 bg-bg2 animate-pulse" />
        <div className="px-12 py-8 space-y-4 max-md:px-6">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-bg2 animate-pulse" />)}
        </div>
      </>
    )
  }

  return (
    <div>

      {/* ── Banner + Avatar (ancho completo) ───────────────────────────────── */}
      <div className="relative border-b border-(--border)">
        {/* Banner */}
        <div className="h-36 w-full" style={{ background: bannerBg }}>
          {/* Marca de agua ◈ decorativa */}
          <span
            className="absolute right-16 top-2 font-serif font-black leading-none select-none pointer-events-none opacity-[0.06] max-md:hidden"
            style={{ fontSize: '140px', color: wallColor ?? 'oklch(80% 0.08 82)' }}
            aria-hidden="true"
          >◈</span>
        </div>

        {/* Avatar + nombre + badge — solapan el borde inferior del banner */}
        <div className="px-12 max-md:px-6">
          <div className="flex items-end gap-5 -mt-14 pb-7">

            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleAvatarChange(f); e.target.value = '' }}
            />

            {/* Avatar — clic para cambiar */}
            <button
              type="button"
              disabled={avatarUploading}
              onClick={() => avatarInputRef.current?.click()}
              title="Cambiar foto de perfil"
              className="relative w-28 h-28 rounded-full border-[3px] shrink-0 overflow-hidden group/av transition-opacity disabled:opacity-70"
              style={{ borderColor: 'var(--color-bg)' }}
            >
              <div className="w-full h-full bg-bg3 flex items-center justify-center">
                {avatarSrc
                  ? /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={avatarSrc} alt={displayName} className="w-full h-full object-cover" />
                  : <span className="font-serif text-[32px] font-bold text-ink3">{initials}</span>
                }
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-ink/0 group-hover/av:bg-ink/55 transition-all">
                <span className="text-[18px] text-bg opacity-0 group-hover/av:opacity-100 transition-opacity">
                  {avatarUploading ? '…' : '✎'}
                </span>
              </div>
            </button>

            {/* Nombre, plan y fecha */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                <h1 className="font-serif text-[26px] font-bold leading-tight">
                  {displayName || <span className="text-ink3">Sin nombre</span>}
                </h1>
                <span className={`text-[9px] tracking-[2px] uppercase px-2.5 py-0.75 border rounded-xs font-semibold shrink-0 ${PLAN_CHIP[plan]}`}>
                  {PLAN_LABEL[plan]}
                </span>
              </div>
              <p className="text-[12px] text-ink3">Miembro desde {memberSince}</p>
              {avatarError && <p className="text-[11px] text-warn mt-1">{avatarError}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* ── Grid: formulario (izq) + preview (der) ─────────────────────────── */}
      <div className="grid md:grid-cols-[1fr_288px] gap-0 items-start">

        {/* ════ Columna izquierda ════ */}
        <form onSubmit={handleSubmit} className="px-12 py-8 max-md:px-6 space-y-8 border-r border-(--border) max-md:border-r-0">

          {/* ── Estadísticas ── */}
          <div className="grid grid-cols-4 gap-0 max-md:grid-cols-2 border border-(--border)">
            {[
              { value: galleries.length,                         label: 'Galerías' },
              { value: totalExposed,                             label: 'Obras expuestas' },
              { value: totalViews.toLocaleString('es-ES'),       label: 'Visitas totales' },
              { value: galleries.filter(g => g.visibility === 'PUBLIC').length, label: 'Públicas' },
            ].map(({ value, label }, i) => (
              <div
                key={label}
                className={`px-5 py-4 ${i < 3 ? 'border-r border-(--border) max-md:border-r-0' : ''} ${i === 1 ? 'max-md:border-r border-(--border)' : ''}`}
              >
                <div className="font-serif text-[28px] font-black leading-none mb-1">{value}</div>
                <div className="text-[10px] tracking-[1.5px] uppercase text-ink3">{label}</div>
              </div>
            ))}
          </div>

          {/* ── Información pública ── */}
          <section>
            <h2 className="font-serif text-[18px] font-bold mb-4">Información pública</h2>
            <div className="grid gap-4">

              <div>
                <label className="block text-[11px] tracking-[2px] uppercase text-ink3 mb-2">
                  Nombre público <span className="text-warn">*</span>
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => { setDisplayName(e.target.value); setNameError('') }}
                  className={`w-full border bg-bg3 text-ink text-[14px] px-4 py-3 outline-none transition-colors placeholder:text-ink3 ${
                    nameError ? 'border-warn' : 'border-(--border) focus:border-(--border-md)'
                  }`}
                />
                {nameError && <p className="text-[12px] text-warn mt-1.5">{nameError}</p>}
              </div>

              <div>
                <label className="block text-[11px] tracking-[2px] uppercase text-ink3 mb-2">Sobre mí</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={4}
                  maxLength={600}
                  placeholder="Cuéntale a los visitantes quién eres y qué haces…"
                  className="w-full border border-(--border) bg-bg3 text-ink text-[14px] px-4 py-3 outline-none resize-none focus:border-(--border-md) transition-colors placeholder:text-ink3"
                />
                <p className="text-[11px] text-ink3 mt-1">{bio.length} / 600</p>
              </div>

              <div>
                <label className="block text-[11px] tracking-[2px] uppercase text-ink3 mb-2">Sitio web</label>
                <input
                  type="url"
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  placeholder="https://tu-sitio.com"
                  className="w-full border border-(--border) bg-bg3 text-ink text-[14px] px-4 py-3 outline-none transition-colors placeholder:text-ink3 focus:border-(--border-md)"
                />
              </div>
            </div>
          </section>

          {/* ── Capacidad del plan ── */}
          <section className="p-5 border border-(--border) bg-bg2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-[18px] font-bold">Capacidad del plan</h2>
              {plan !== 'PREMIUM' && (
                <Link
                  href="/dashboard/plan"
                  className="text-[11px] px-3 py-1.5 border border-gold text-gold bg-(--gold-dim) hover:bg-[oklch(60%_0.130_82/0.18)] transition-colors no-underline rounded-xs"
                >
                  Mejorar →
                </Link>
              )}
            </div>
            <div className="grid gap-3.5">
              <CapacityBar
                used={galleries.length}
                max={limits.galleries}
                label="Galerías"
              />
              <CapacityBar
                used={totalExposed}
                max={limits.galleries * limits.artworksPerGallery}
                label="Obras expuestas"
              />
            </div>
          </section>

          {/* ── URL pública ── */}
          <section>
            <h2 className="font-serif text-[18px] font-bold mb-3">URL pública</h2>
            {firstPublicGal ? (
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2.5 border border-(--border) bg-bg3 px-4 py-2.5 min-w-0">
                  <span className="text-ink3 text-[13px] shrink-0 opacity-50">◎</span>
                  <span className="text-[13px] text-ink2 truncate">/galleries/{firstPublicGal.slug}</span>
                </div>
                <button
                  type="button"
                  onClick={() => publicUrl && copyToClipboard(publicUrl, setUrlCopied)}
                  className={`shrink-0 px-4 py-2.5 border text-[12px] transition-all ${
                    urlCopied
                      ? 'border-ok text-ok bg-(--ok-dim)'
                      : 'border-(--border) text-ink3 hover:border-(--border-md) hover:text-ink'
                  }`}
                >
                  {urlCopied ? '✓ Copiado' : 'Copiar'}
                </button>
                <a
                  href={`/galleries/${firstPublicGal.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 px-4 py-2.5 border border-(--border) text-ink3 hover:border-(--border-md) hover:text-ink transition-all no-underline text-[14px] flex items-center"
                >
                  ↗
                </a>
              </div>
            ) : (
              <div className="flex items-center justify-between border border-dashed border-(--border) px-5 py-4">
                <p className="text-[13px] text-ink3">Ninguna galería pública todavía.</p>
                <Link
                  href="/dashboard/galleries"
                  className="text-[12px] text-gold no-underline hover:underline"
                >
                  Crear galería →
                </Link>
              </div>
            )}
          </section>

          {/* ── Cuenta ── */}
          <section className="p-5 border border-(--border) bg-bg2">
            <h2 className="font-serif text-[18px] font-bold mb-4">Cuenta</h2>
            <div className="grid gap-3 text-[13px]">
              <div className="flex justify-between items-center">
                <span className="text-ink3">Email</span>
                <span className="text-ink">{user?.primaryEmailAddress?.emailAddress ?? '—'}</span>
              </div>
              <div className="h-px bg-(--border)" />
              <div className="flex justify-between items-center">
                <span className="text-ink3">Contraseña</span>
                <button
                  type="button"
                  onClick={() => openUserProfile()}
                  className="text-[12px] text-ink3 border-b border-(--border) hover:text-ink hover:border-(--border-md) transition-all"
                >
                  Cambiar →
                </button>
              </div>
            </div>
          </section>

          {/* ── Guardar ── */}
          {apiError && (
            <p className="text-[13px] text-warn border border-warn/30 bg-warn/5 px-4 py-3">{apiError}</p>
          )}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={updateArtist.isPending}
              className="relative overflow-hidden text-[13px] px-7 py-2.75 rounded-xs text-bg bg-ink font-medium hover:-translate-y-px transition-all ease-[cubic-bezier(.22,1,.36,1)] group disabled:opacity-60"
            >
              <span className="absolute inset-0 bg-gold -translate-x-full group-hover:translate-x-0 transition-transform duration-400 ease-[cubic-bezier(.22,1,.36,1)]" />
              <span className="relative z-1">{updateArtist.isPending ? 'Guardando…' : 'Guardar cambios'}</span>
            </button>
            {saved && <span className="text-[13px] text-ok">✓ Guardado</span>}
          </div>
        </form>

        {/* ════ Columna derecha: preview ════ */}
        <div className="md:sticky md:top-16 px-6 py-8 space-y-4 max-md:px-12 max-md:pb-12 max-md:border-t max-md:border-(--border)">

          <p className="text-[10px] tracking-[3px] uppercase text-ink3 mb-1">Vista previa pública</p>

          {/* Tarjeta al estilo ArtistBar */}
          <div className="border border-(--border) overflow-hidden">
            <div className="p-5" style={{ background: 'oklch(11% 0.008 75)' }}>

              {/* Avatar + nombre */}
              <div className="flex items-center gap-3.5 mb-4">
                <div
                  className="w-11 h-11 rounded-full shrink-0 overflow-hidden border flex items-center justify-center"
                  style={{ borderColor: 'oklch(100% 0 0 / .12)' }}
                >
                  {avatarSrc
                    ? /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={avatarSrc} alt={displayName} className="w-full h-full object-cover" />
                    : (
                      <div
                        className="w-full h-full flex items-center justify-center font-serif font-bold text-[13px]"
                        style={{
                          background: 'radial-gradient(ellipse at 25% 75%, oklch(68% .10 300), oklch(84% .14 82))',
                          color:      'oklch(94% 0.008 75)',
                        }}
                      >
                        {initials}
                      </div>
                    )
                  }
                </div>
                <div>
                  <p className="text-[9px] tracking-[3px] uppercase mb-0.5" style={{ color: 'oklch(100% 0 0 / .3)' }}>Artista</p>
                  <p className="font-serif text-[16px] font-bold leading-tight" style={{ color: 'oklch(94% 0.008 75)' }}>
                    {displayName || <span style={{ color: 'oklch(100% 0 0 / .2)' }}>Sin nombre</span>}
                  </p>
                </div>
              </div>

              {/* Bio */}
              {bio ? (
                <p className="text-[12px] leading-[1.75] line-clamp-4 mb-4" style={{ color: 'oklch(100% 0 0 / .45)' }}>
                  {bio}
                </p>
              ) : (
                <p className="text-[12px] italic mb-4" style={{ color: 'oklch(100% 0 0 / .18)' }}>
                  Sin bio todavía…
                </p>
              )}

              {/* Stats mini */}
              <div className="flex items-center gap-5 pt-4" style={{ borderTop: '1px solid oklch(100% 0 0 / .07)' }}>
                <div>
                  <p className="font-serif text-[20px] font-black leading-none" style={{ color: 'oklch(94% 0.008 75)' }}>
                    {totalExposed}
                  </p>
                  <p className="text-[9px] tracking-[2px] uppercase mt-0.5" style={{ color: 'oklch(100% 0 0 / .3)' }}>Obras</p>
                </div>
                {website && (
                  <p className="ml-auto text-[11px] truncate" style={{ color: 'var(--color-gold)', maxWidth: '130px' }}>
                    {website.replace(/^https?:\/\//, '')}
                  </p>
                )}
              </div>
            </div>

            {/* Indicador "se actualiza en vivo" */}
            <div className="px-4 py-2 bg-bg2 border-t border-(--border) flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-ok opacity-60" />
              <span className="text-[10px] text-ink3 tracking-wide">Se actualiza en vivo</span>
            </div>
          </div>


        </div>
      </div>
    </div>
  )
}
