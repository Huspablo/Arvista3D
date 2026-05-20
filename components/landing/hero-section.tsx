'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const STATS = [
  { target: 1200, label: 'Artistas' },
  { target: 8400, label: 'Obras' },
  { target: 340,  label: 'Galerías' },
]

function fmt(n: number) {
  return n >= 1000 ? (Math.round(n / 100) / 10) + 'k' : Math.round(n) + ''
}

export function HeroSection() {
  const parallaxRef = useRef<HTMLDivElement>(null)
  const statsRef    = useRef<HTMLDivElement>(null)
  const [counts, setCounts] = useState(STATS.map(() => 0))

  // Parallax scroll
  useEffect(() => {
    const onScroll = () => {
      if (!parallaxRef.current) return
      parallaxRef.current.style.transform = `scale(1.05) translateY(${window.scrollY * 0.06}px)`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Counter animation on first intersection
  useEffect(() => {
    if (!statsRef.current) return
    const obs = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return
      obs.disconnect()
      STATS.forEach((s, idx) => {
        const duration = 1800
        const start = performance.now()
        const step = (now: number) => {
          const t = Math.min((now - start) / duration, 1)
          const ease = 1 - Math.pow(1 - t, 4)
          setCounts(prev => { const next = [...prev]; next[idx] = s.target * ease; return next })
          if (t < 1) requestAnimationFrame(step)
          else setCounts(prev => { const next = [...prev]; next[idx] = s.target; return next })
        }
        requestAnimationFrame(step)
      })
    }, { threshold: 0.5 })
    obs.observe(statsRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section className="relative min-h-screen pt-25 grid grid-cols-2 items-center gap-15 max-w-370 mx-auto px-15 overflow-hidden max-md:grid-cols-1 max-md:px-6 max-md:pt-30 max-md:pb-16 max-md:gap-12">
      {/* Subtle grid lines */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-45 max-md:hidden"
        style={{
          backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* ── LEFT ── */}
      <div className="relative z-2 max-md:order-2">
        {/* Eyebrow */}
        <div
          className="flex items-center gap-3.5 text-gold text-[11px] tracking-[5px] uppercase mb-8"
          style={{ opacity: 0, animation: 'fadeUp 0.9s 0.15s forwards' }}
        >
          <div className="flex-none w-12 h-px" style={{ background: 'var(--gold-line)' }} />
          Experiencias artísticas en 3D
        </div>

        {/* Title */}
        <h1
          className="font-serif font-black leading-[.92] tracking-[-2px] mb-8"
          style={{
            fontSize: 'clamp(52px, 6.5vw, 100px)',
            opacity: 0,
            animation: 'fadeUp 1s 0.3s forwards',
          }}
        >
          Arte sin<br />
          <em className="italic text-gold">fronteras.</em>
        </h1>

        {/* Subtitle */}
        <p
          className="text-[17px] leading-[1.8] text-ink2 max-w-105 mb-12"
          style={{ opacity: 0, animation: 'fadeUp 0.9s 0.5s forwards' }}
        >
          Crea tu galería digital, expón tu obra al mundo y conecta con coleccionistas y amantes del arte en una experiencia inmersiva única.
        </p>

        {/* Buttons */}
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

        {/* Stats */}
        <div
          ref={statsRef}
          className="flex gap-9 mt-13 pt-9 border-t border-(--border) max-md:gap-6"
          style={{ opacity: 0, animation: 'fadeUp 0.9s 0.8s forwards' }}
        >
          {STATS.map((s, i) => (
            <div key={s.label}>
              <span className="font-serif text-[28px] font-black text-ink block">
                {fmt(counts[i])}+
              </span>
              <span className="text-[12px] text-ink3 tracking-[1px]">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT ── */}
      <div
        className="relative z-2 max-md:order-1"
        style={{ opacity: 0, animation: 'fadeUp 1.1s 0.4s forwards' }}
      >
        {/* Floating art frames */}
        <div
          className="art-frame art-p3"
          style={{ width: 90, height: 110, top: -24, left: -20, animation: 'fl3 8s ease-in-out infinite' }}
        />
        <div
          className="art-frame art-p5"
          style={{ width: 75, height: 90, bottom: 60, right: -22, animation: 'fl4 10s ease-in-out infinite 1.5s' }}
        />

        <div className="relative">
          {/* Photo frame */}
          <div className="w-full aspect-[4/5] overflow-hidden relative border border-(--border) max-md:aspect-[3/2]">
            <div ref={parallaxRef} className="absolute inset-0 scale-[1.05]">
              <Image
                src="/images/hero.jpg"
                alt="Artista en galería"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Badge */}
          <div
            className="absolute bottom-6 -left-7 bg-bg border border-(--border) px-5 py-3.5 shadow-md flex flex-col gap-0.5 max-md:left-3 max-md:bottom-3"
            style={{ animation: 'fl2 7s ease-in-out infinite' }}
          >
            <span className="font-serif text-[16px] font-bold">Mariana López</span>
            <span className="text-[11px] text-ink3 tracking-[2px] uppercase">Artista · Madrid</span>
          </div>

          {/* Tag */}
          <div
            className="absolute top-7 -right-5 bg-gold text-bg px-4 py-2 text-[11px] font-semibold tracking-[2px] uppercase max-md:top-4 max-md:right-3"
            style={{ animation: 'fl1 9s ease-in-out infinite 1s' }}
          >
            Galería abierta
          </div>
        </div>
      </div>
    </section>
  )
}
