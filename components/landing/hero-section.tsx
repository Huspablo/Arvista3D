'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

// ── Stats ─────────────────────────────────────────────────────────────────────

const STATS = [
  { target: 1200, label: 'Artistas' },
  { target: 8400, label: 'Obras' },
  { target: 340,  label: 'Galerías' },
]

function fmt(n: number) {
  return n >= 1000 ? (Math.round(n / 100) / 10) + 'k' : String(Math.round(n))
}

// ── Accordion panels ──────────────────────────────────────────────────────────

const PANELS = [
  { src: '/images/landing/landing3.png', alt: 'Galería de arte',   label: 'Exposición permanente' },
  { src: '/images/landing/landing1.png', alt: 'Sala principal',    label: 'Sala de exhibición'   },
  { src: '/images/landing/landing5.png', alt: 'Arte íntimo',       label: 'Colección privada'    },
  { src: '/images/landing/landing4.png', alt: 'Galería virtual 3D',label: 'Recorrido virtual'    },
  { src: '/images/landing/landing2.png', alt: 'Arte moderno',      label: 'Arte contemporáneo'   },
]

const INTERVAL_MS   = 3500
const FLEX_ACTIVE   = 4.2
const FLEX_INACTIVE = 0.55

// ── Component ─────────────────────────────────────────────────────────────────

export function HeroSection() {
  const statsRef = useRef<HTMLDivElement>(null)
  const [counts, setCounts] = useState(STATS.map(() => 0))

  // Accordion state
  const [activeIdx,  setActiveIdx]  = useState(0)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const isPaused     = hoveredIdx !== null
  const displayedIdx = hoveredIdx ?? activeIdx

  // ── Autoplay: pauses on hover/focus, resumes on leave ────────────────────────
  useEffect(() => {
    if (isPaused) return
    const id = setInterval(() => {
      setActiveIdx(i => (i + 1) % PANELS.length)
    }, INTERVAL_MS)
    return () => clearInterval(id)
  }, [isPaused])

  // ── Stats counter animation ───────────────────────────────────────────────────
  useEffect(() => {
    if (!statsRef.current) return
    const obs = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return
      obs.disconnect()
      STATS.forEach((s, idx) => {
        const dur = 1800
        const t0  = performance.now()
        const step = (now: number) => {
          const t    = Math.min((now - t0) / dur, 1)
          const ease = 1 - Math.pow(1 - t, 4)
          setCounts(p => { const n = [...p]; n[idx] = s.target * ease; return n })
          if (t < 1) requestAnimationFrame(step)
          else setCounts(p => { const n = [...p]; n[idx] = s.target; return n })
        }
        requestAnimationFrame(step)
      })
    }, { threshold: 0.5 })
    obs.observe(statsRef.current)
    return () => obs.disconnect()
  }, [])

  // When entering a panel: update activeIdx so autoplay resumes from here
  const onPanelEnter = (i: number) => {
    setHoveredIdx(i)
    setActiveIdx(i)
  }

  return (
    <section className="relative min-h-screen pt-25 grid grid-cols-2 items-center gap-15 max-w-370 mx-auto px-15 overflow-hidden max-md:grid-cols-1 max-md:px-6 max-md:pt-30 max-md:pb-16 max-md:gap-12">

      {/* Background grid lines */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-45 max-md:hidden"
        style={{
          backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* ── LEFT: text content ──────────────────────────────────────────────── */}
      <div className="relative z-2 max-md:order-2">

        <div
          className="flex items-center gap-3.5 text-gold text-[11px] tracking-[5px] uppercase mb-8"
          style={{ opacity: 0, animation: 'fadeUp 0.9s 0.15s forwards' }}
        >
          <div className="flex-none w-12 h-px" style={{ background: 'var(--gold-line)' }} />
          Experiencias artísticas en 3D
        </div>

        <h1
          className="font-serif font-black leading-[.92] tracking-[-2px] mb-8"
          style={{ fontSize: 'clamp(52px, 6.5vw, 100px)', opacity: 0, animation: 'fadeUp 1s 0.3s forwards' }}
        >
          Arte sin<br />
          <em className="italic text-gold">fronteras.</em>
        </h1>

        <p
          className="text-[17px] leading-[1.8] text-ink2 max-w-105 mb-12"
          style={{ opacity: 0, animation: 'fadeUp 0.9s 0.5s forwards' }}
        >
          Crea tu galería digital, expón tu obra al mundo y conecta con coleccionistas y amantes del arte en una experiencia inmersiva única.
        </p>

        <div
          className="flex gap-3 max-md:flex-col"
          style={{ opacity: 0, animation: 'fadeUp 0.9s 0.65s forwards' }}
        >
          <Link
            href="#obras"
            className="relative overflow-hidden bg-ink text-bg px-10 py-4 rounded-xs text-[15px] font-medium tracking-[0.4px] no-underline hover:-translate-y-0.5 hover:shadow-md transition-all ease-[cubic-bezier(.22,1,.36,1)] group max-md:text-center"
          >
            <span className="absolute inset-0 bg-gold -translate-x-full group-hover:translate-x-0 transition-transform duration-450 ease-[cubic-bezier(.22,1,.36,1)]" />
            <span className="relative z-1">Explorar obras</span>
          </Link>
          <Link
            href="/dashboard"
            className="bg-transparent text-ink px-10 py-4 rounded-xs border-[1.5px] text-[15px] font-light tracking-[0.4px] no-underline hover:border-ink hover:-translate-y-0.5 transition-all ease-[cubic-bezier(.22,1,.36,1)] max-md:text-center"
            style={{ borderColor: 'var(--border-md)' }}
          >
            Crear mi galería
          </Link>
        </div>

        <div
          ref={statsRef}
          className="flex gap-9 mt-13 pt-9 border-t border-(--border) max-md:gap-6"
          style={{ opacity: 0, animation: 'fadeUp 0.9s 0.8s forwards' }}
        >
          {STATS.map((s, i) => (
            <div key={s.label}>
              <span className="font-serif text-[28px] font-black text-ink block">{fmt(counts[i])}+</span>
              <span className="text-[12px] text-ink3 tracking-[1px]">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT: image accordion ──────────────────────────────────────────── */}
      <div
        className="relative z-2 max-md:order-1"
        style={{ opacity: 0, animation: 'fadeUp 1.1s 0.4s forwards' }}
      >
        {/* Decorative floating frames */}
        <div className="art-frame art-p3" style={{ width: 90, height: 110, top: -24, left: -20, animation: 'fl3 8s ease-in-out infinite' }} />
        <div className="art-frame art-p5" style={{ width: 75, height: 90, bottom: 60, right: -22, animation: 'fl4 10s ease-in-out infinite 1.5s' }} />

        {/* ── Desktop: horizontal accordion ───────────────────────────────── */}
        <div className="relative max-md:hidden">
          <div
            className="relative flex h-[58vh] max-h-130 overflow-hidden bg-ink"
            role="group"
            aria-label="Galería de imágenes"
            onMouseLeave={() => setHoveredIdx(null)}
          >
            {PANELS.map((panel, i) => {
              const isActive = i === displayedIdx
              return (
                <div
                  key={panel.src}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isActive}
                  aria-label={panel.alt}
                  className="relative overflow-hidden cursor-pointer focus-visible:outline-2 focus-visible:outline-gold focus-visible:-outline-offset-2"
                  style={{
                    flexGrow:   isActive ? FLEX_ACTIVE : FLEX_INACTIVE,
                    flexShrink: 1,
                    flexBasis:  '0%',
                    minWidth:   '36px',
                    transition: 'flex-grow 0.65s cubic-bezier(.22,1,.36,1)',
                  }}
                  onMouseEnter={() => onPanelEnter(i)}
                  onFocus={() => onPanelEnter(i)}
                  onBlur={() => setHoveredIdx(null)}
                  onClick={() => { setActiveIdx(i); setHoveredIdx(null) }}
                >
                  {/* Image — scales in slightly when inactive */}
                  <Image
                    src={panel.src}
                    alt={panel.alt}
                    fill
                    sizes="(max-width: 1280px) 60vw, 30vw"
                    priority={i === 0}
                    className="object-cover"
                    style={{
                      transform:  isActive ? 'scale(1)' : 'scale(1.06)',
                      transition: 'transform 0.7s cubic-bezier(.22,1,.36,1)',
                    }}
                  />

                  {/* Dark tint on inactive panels */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'oklch(8% 0 0 / 0.30)',
                      opacity:    isActive ? 0 : 1,
                      transition: 'opacity 0.55s ease',
                    }}
                  />

                  {/* Active: gradient + label + counter */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'linear-gradient(to top, oklch(8% 0.012 75 / 0.72) 0%, transparent 50%)',
                      opacity:    isActive ? 1 : 0,
                      transition: 'opacity 0.5s ease',
                    }}
                  >
                    <div className="absolute bottom-0 left-0 right-0 px-5 py-5 flex items-end justify-between">
                      <span
                        className="text-[9px] tracking-[4px] uppercase font-medium"
                        style={{ color: 'oklch(65% 0.130 82)' }}
                      >
                        ◇ {panel.label}
                      </span>
                      <span
                        className="text-[10px] font-mono tabular-nums"
                        style={{ color: 'oklch(80% 0 0 / 0.55)' }}
                      >
                        {String(i + 1).padStart(2, '0')}&thinsp;/&thinsp;{PANELS.length}
                      </span>
                    </div>
                  </div>

                  {/* Gold accent line — sweeps in from left on activation */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
                    style={{
                      background:      'linear-gradient(to right, oklch(60% 0.130 82), oklch(68% 0.140 82 / 0))',
                      transform:       isActive ? 'scaleX(1)' : 'scaleX(0)',
                      transformOrigin: 'left center',
                      transition:      'transform 0.6s cubic-bezier(.22,1,.36,1) 0.15s',
                    }}
                  />
                </div>
              )
            })}

            {/* Floating badge */}
            <div
              className="absolute bottom-6 -left-7 bg-bg border border-(--border) px-5 py-3.5 shadow-md flex flex-col gap-0.5 z-20"
              style={{ animation: 'fl2 7s ease-in-out infinite' }}
            >
              <span className="font-serif text-[16px] font-bold">Mariana López</span>
              <span className="text-[11px] text-ink3 tracking-[2px] uppercase">Artista · Madrid</span>
            </div>

            {/* Tag */}
            <div
              className="absolute top-6 -right-5 bg-gold text-bg px-4 py-2 text-[11px] font-semibold tracking-[2px] uppercase z-20"
              style={{ animation: 'fl1 9s ease-in-out infinite 1s' }}
            >
              Galería abierta
            </div>
          </div>

          {/* Progress indicators */}
          <div className="flex items-center gap-2 mt-3">
            {PANELS.map((_, i) => (
              <button
                key={i}
                onClick={() => { setActiveIdx(i); setHoveredIdx(null) }}
                aria-label={`Ver imagen ${i + 1}`}
                className="h-px transition-all duration-400 ease-[cubic-bezier(.22,1,.36,1)]"
                style={{
                  width:      i === displayedIdx ? '28px' : '8px',
                  background: i === displayedIdx ? 'var(--color-gold)' : 'oklch(14% 0.010 75 / 0.22)',
                }}
              />
            ))}
            <span className="ml-auto text-[10px] text-ink3 tracking-[2px] tabular-nums">
              {String(displayedIdx + 1).padStart(2, '0')} / {PANELS.length}
            </span>
          </div>
        </div>

        {/* ── Mobile: crossfade carousel + dots ───────────────────────────── */}
        <div className="md:hidden">
          <div className="relative aspect-4/3 overflow-hidden bg-ink">
            {PANELS.map((panel, i) => (
              <div
                key={panel.src}
                className="absolute inset-0"
                aria-hidden={i !== displayedIdx}
                style={{
                  opacity:    i === displayedIdx ? 1 : 0,
                  transition: 'opacity 0.7s ease',
                }}
              >
                <Image
                  src={panel.src}
                  alt={panel.alt}
                  fill
                  sizes="100vw"
                  priority={i === 0}
                  className="object-cover"
                />
              </div>
            ))}

            {/* Mobile label */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(to top, oklch(8% 0.012 75 / 0.6) 0%, transparent 45%)' }}
            >
              <div className="absolute bottom-0 left-0 right-0 px-4 py-4">
                <span
                  className="text-[9px] tracking-[3px] uppercase"
                  style={{ color: 'oklch(65% 0.130 82)' }}
                >
                  ◇ {PANELS[displayedIdx].label}
                </span>
              </div>
            </div>

            {/* Gold bottom line */}
            <div
              className="absolute bottom-0 left-0 right-0 h-px z-10"
              style={{ background: 'var(--color-gold)' }}
            />
          </div>

          {/* Mobile dots */}
          <div className="flex items-center gap-2 mt-3">
            {PANELS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                aria-label={`Ver imagen ${i + 1}`}
                className="h-px transition-all duration-400 ease-[cubic-bezier(.22,1,.36,1)]"
                style={{
                  width:      i === displayedIdx ? '24px' : '8px',
                  background: i === displayedIdx ? 'var(--color-gold)' : 'oklch(14% 0.010 75 / 0.22)',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
