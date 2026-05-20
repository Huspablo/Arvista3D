'use client'

import { useEffect, useRef, useState } from 'react'

const STATS = [
  {
    label:   'Galerías',
    value:   2,
    sub:     'de 3 disponibles',
    bar:     67,
    barColor:'var(--color-ok)',
    icon:    '◻',
    warn:    false,
  },
  {
    label:   'Obras expuestas',
    value:   10,
    sub:     'de 10 — límite alcanzado',
    bar:     100,
    barColor:'var(--color-warn)',
    icon:    '◇',
    warn:    true,
    warnMsg: '⚠ Amplía tu plan',
  },
  {
    label:   'Visitas este mes',
    value:   847,
    sub:     '+23% vs mes anterior',
    bar:     72,
    barColor:'var(--color-gold)',
    icon:    '↗',
    warn:    false,
  },
  {
    label:   'Contactos recibidos',
    value:   12,
    sub:     'este mes',
    bar:     55,
    barColor:'var(--color-ok)',
    icon:    '◈',
    warn:    false,
  },
]

function fmt(n: number) {
  return n >= 1000 ? (Math.round(n / 100) / 10) + 'k' : Math.round(n) + ''
}

export function StatsRow() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [counts, setCounts] = useState(STATS.map(() => 0))
  const [barsVisible, setBarsVisible] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return
    const obs = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return
      obs.disconnect()
      setBarsVisible(true)
      STATS.forEach((s, idx) => {
        const duration = 1600
        const start = performance.now()
        const step = (now: number) => {
          const t    = Math.min((now - start) / duration, 1)
          const ease = 1 - Math.pow(1 - t, 4)
          setCounts(prev => { const next = [...prev]; next[idx] = s.value * ease; return next })
          if (t < 1) requestAnimationFrame(step)
          else setCounts(prev => { const next = [...prev]; next[idx] = s.value; return next })
        }
        requestAnimationFrame(step)
      })
    }, { threshold: 0.3 })
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      className="grid grid-cols-4 gap-3 mb-8 max-md:grid-cols-2"
    >
      {STATS.map((s, i) => (
        <div
          key={s.label}
          className={`bg-bg border px-6 py-6 relative overflow-hidden hover:border-(--border-md) hover:shadow-md hover:-translate-y-0.5 transition-all ease-[cubic-bezier(.22,1,.36,1)] reveal ${i > 0 ? `rd${i}` : ''} ${s.warn ? 'border-[oklch(62%_0.18_32/0.3)]' : 'border-(--border)'}`}
        >
          <span className="text-[11px] tracking-[3px] uppercase text-ink3 mb-3 block">{s.label}</span>
          <span
            className="font-serif text-[44px] font-black leading-none block mb-1.5"
            style={{ color: s.warn ? 'var(--color-warn)' : 'var(--color-ink)' }}
          >
            {fmt(counts[i])}
          </span>
          <span className="text-[13px] text-ink3">{s.sub}</span>
          <div className="h-0.75 bg-(--border) rounded-sm mt-4 overflow-hidden">
            <div
              className="h-full rounded-sm transition-all duration-1000 ease-[cubic-bezier(.22,1,.36,1)]"
              style={{
                width: barsVisible ? `${s.bar}%` : '0%',
                background: s.barColor,
              }}
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
