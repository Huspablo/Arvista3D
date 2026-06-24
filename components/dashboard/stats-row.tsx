'use client'

import { useEffect, useRef, useState } from 'react'
import { useArtist } from '@/lib/hooks/use-artist'
import { useGalleries } from '@/lib/hooks/use-galleries'
import { useArtworks } from '@/lib/hooks/use-artworks'
import { PLAN_LIMITS } from '@/lib/services/artist.service'

function fmt(n: number) {
  return n >= 1000 ? (Math.round(n / 100) / 10) + 'k' : Math.round(n) + ''
}

function AnimatedStat({ value, warn }: { value: number; warn?: boolean }) {
  const [count, setCount] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    if (started.current || value === 0) return
    started.current = true
    const duration = 1400
    const start    = performance.now()
    const step     = (now: number) => {
      const t    = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - t, 4)
      setCount(value * ease)
      if (t < 1) requestAnimationFrame(step)
      else setCount(value)
    }
    requestAnimationFrame(step)
  }, [value])

  return (
    <span
      className="font-serif text-[44px] font-black leading-none block mb-1.5"
      style={{ color: warn ? 'var(--color-warn)' : 'var(--color-ink)' }}
    >
      {fmt(count)}
    </span>
  )
}

export function StatsRow() {
  const containerRef               = useRef<HTMLDivElement>(null)
  const [visible, setVisible]      = useState(false)
  const { data: artist }           = useArtist()
  const { data: galleries = [] }   = useGalleries()
  const { data: artworks  = [] }   = useArtworks()

  const plan         = artist?.plan ?? 'BASIC'
  const limits       = PLAN_LIMITS[plan]
  const exposedCount = artworks.filter(a => a.status === 'EXPOSED').length
  const totalLimit   = galleries.length > 0 ? galleries.length * limits.artworksPerGallery : limits.artworksPerGallery
  const artworkWarn  = exposedCount >= totalLimit

  const stats = [
    {
      label:    'Galerías',
      value:    galleries.length,
      sub:      `de ${limits.galleries} disponibles`,
      bar:      (galleries.length / limits.galleries) * 100,
      barColor: 'var(--color-ok)',
      icon:     '◻',
      warn:     false,
    },
    {
      label:    'Obras expuestas',
      value:    exposedCount,
      sub:      artworkWarn ? `de ${totalLimit} — límite alcanzado` : `de ${totalLimit}`,
      bar:      (exposedCount / totalLimit) * 100,
      barColor: artworkWarn ? 'var(--color-warn)' : 'var(--color-gold)',
      icon:     '◇',
      warn:     artworkWarn,
      warnMsg:  artworkWarn ? '⚠ Amplía tu plan' : undefined,
    },
    {
      label:    'Total obras',
      value:    artworks.length,
      sub:      `${artworks.filter(a => a.status === 'DRAFT').length} sin exponer`,
      bar:      artworks.length > 0 ? (exposedCount / artworks.length) * 100 : 0,
      barColor: 'var(--color-gold)',
      icon:     '◈',
      warn:     false,
    },
    {
      label:    'Galerías públicas',
      value:    galleries.filter(g => g.visibility === 'PUBLIC').length,
      sub:      `de ${galleries.length} galerías`,
      bar:      galleries.length > 0 ? (galleries.filter(g => g.visibility === 'PUBLIC').length / galleries.length) * 100 : 0,
      barColor: 'var(--color-ok)',
      icon:     '↗',
      warn:     false,
    },
  ]

  useEffect(() => {
    if (!containerRef.current) return
    const obs = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return
      obs.disconnect()
      setVisible(true)
    }, { threshold: 0.3 })
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="grid grid-cols-4 gap-3 mb-8 max-md:grid-cols-2">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className={`bg-bg border px-6 py-6 relative overflow-hidden hover:border-(--border-md) hover:shadow-md hover:-translate-y-0.5 transition-all ease-[cubic-bezier(.22,1,.36,1)] reveal ${i > 0 ? `rd${i}` : ''} ${s.warn ? 'border-[oklch(62%_0.18_32/0.3)]' : 'border-(--border)'}`}
        >
          <span className="text-[11px] tracking-[3px] uppercase text-ink3 mb-3 block">{s.label}</span>
          {visible ? (
            <AnimatedStat value={s.value} warn={s.warn} />
          ) : (
            <span className="font-serif text-[44px] font-black leading-none block mb-1.5 text-ink">0</span>
          )}
          <span className="text-[13px] text-ink3">{s.sub}</span>
          <div className="h-0.75 bg-(--border) rounded-sm mt-4 overflow-hidden">
            <div
              className="h-full rounded-sm transition-all duration-1000 ease-[cubic-bezier(.22,1,.36,1)]"
              style={{ width: visible ? `${Math.min(s.bar, 100)}%` : '0%', background: s.barColor }}
            />
          </div>
          {s.warn && s.warnMsg && (
            <div className="mt-2.5 text-[12px] flex items-center gap-1.5" style={{ color: 'var(--color-warn)' }}>
              {s.warnMsg}
            </div>
          )}
          <span className="absolute top-4 right-4 text-[18px] opacity-25">{s.icon}</span>
        </div>
      ))}
    </div>
  )
}
