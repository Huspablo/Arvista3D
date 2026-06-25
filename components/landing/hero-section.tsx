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
  return n >= 1000 ? (Math.round(n / 100) / 10) + 'k' : String(Math.round(n))
}

interface CardDef {
  src: string
  alt: string
  depth: number
  z: number
  priority?: boolean
  sizes: string
  aspect: number        // CSS aspect-ratio value (width ÷ height)
  pos: React.CSSProperties
}

// 5 images positioned as floating art pieces at different depth layers.
// depth controls how far each card shifts when the cursor moves (higher = moves more = feels further back).
const CARDS: CardDef[] = [
  {
    src: '/images/landing/landing3.png', alt: 'Galería de arte',
    depth: 0.5, z: 3, priority: true,
    sizes: '(max-width: 1024px) 90vw, 26vw',
    aspect: 0.75,
    pos: { left: '2%', top: '5%', width: '52%' },
  },
  {
    src: '/images/landing/landing5.png', alt: 'Arte contemporáneo',
    depth: 1.0, z: 4,
    sizes: '18vw',
    aspect: 0.75,
    pos: { right: '0%', top: '2%', width: '32%' },
  },
  {
    src: '/images/landing/landing1.png', alt: 'Exposición de arte',
    depth: 0.8, z: 2,
    sizes: '24vw',
    aspect: 1.79,
    pos: { left: '2%', bottom: '2%', width: '46%' },
  },
  {
    src: '/images/landing/landing4.png', alt: 'Galería virtual',
    depth: 1.3, z: 3,
    sizes: '20vw',
    aspect: 1.79,
    pos: { right: '2%', bottom: '4%', width: '36%' },
  },
  {
    src: '/images/landing/landing2.png', alt: 'Arte moderno',
    depth: 1.8, z: 1,
    sizes: '15vw',
    aspect: 1.79,
    pos: { left: '33%', top: '0%', width: '27%' },
  },
]

export function HeroSection() {
  const colRef   = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  // Parallax wrappers — get JS translateX/Y applied in RAF
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  // Image elements — get cursor-pan transform on card hover
  const imgRefs  = useRef<(HTMLImageElement | null)[]>([])
  const rafRef   = useRef<number | null>(null)
  // Separate current (lerped) and target (raw) mouse position
  const mouse = useRef({ x: 0, y: 0, tx: 0, ty: 0 })

  const [counts, setCounts]   = useState(STATS.map(() => 0))
  const [hovered, setHovered] = useState<number | null>(null)

  // Lerped parallax — runs every frame, smoothly chases the mouse
  useEffect(() => {
    const tick = () => {
      const m = mouse.current
      m.x += (m.tx - m.x) * 0.07
      m.y += (m.ty - m.y) * 0.07
      CARDS.forEach((card, i) => {
        const el = cardRefs.current[i]
        if (!el) return
        el.style.transform = `translate(${m.x * card.depth * 26}px, ${m.y * card.depth * 18}px)`
      })
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  // Stats counter animation triggered on scroll into view
  useEffect(() => {
    if (!statsRef.current) return
    const obs = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return
      obs.disconnect()
      STATS.forEach((s, idx) => {
        const dur = 1800
        const t0 = performance.now()
        const step = (now: number) => {
          const t = Math.min((now - t0) / dur, 1)
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

  // Update parallax target from cursor position within the column
  const onColMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = colRef.current?.getBoundingClientRect()
    if (!rect) return
    mouse.current.tx = (e.clientX - rect.left)  / rect.width  - 0.5
    mouse.current.ty = (e.clientY - rect.top)   / rect.height - 0.5
  }

  const onColLeave = () => { mouse.current.tx = 0; mouse.current.ty = 0 }

  // Pan the image to "look around" inside it as the cursor moves over the card
  const onCardMove = (e: React.MouseEvent<HTMLDivElement>, i: number) => {
    const img = imgRefs.current[i]
    if (!img) return
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width  - 0.5
    const y = (e.clientY - r.top)  / r.height - 0.5
    img.style.transform = `scale(1.09) translate(${-x * 8}%, ${-y * 8}%)`
  }

  const onCardLeave = (i: number) => {
    const img = imgRefs.current[i]
    if (img) img.style.transform = ''
    setHovered(null)
  }

  return (
    <section className="relative min-h-screen pt-25 grid grid-cols-2 items-center gap-15 max-w-370 mx-auto px-15 overflow-hidden max-md:grid-cols-1 max-md:px-6 max-md:pt-30 max-md:pb-16 max-md:gap-12">

      {/* Subtle background grid */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-45 max-md:hidden"
        style={{
          backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* ── LEFT: text content ── */}
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

      {/* ── RIGHT: floating image collage ── */}
      <div
        className="relative z-2 max-md:order-1"
        style={{ opacity: 0, animation: 'fadeUp 1.1s 0.4s forwards' }}
      >
        {/* Decorative floating art frames — kept from original */}
        <div className="art-frame art-p3" style={{ width: 90, height: 110, top: -24, left: -20, animation: 'fl3 8s ease-in-out infinite' }} />
        <div className="art-frame art-p5" style={{ width: 75, height: 90, bottom: 100, right: -22, animation: 'fl4 10s ease-in-out infinite 1.5s' }} />

        {/* Mobile: single clean image */}
        <div className="md:hidden relative aspect-4/3 overflow-hidden">
          <Image
            src="/images/landing/landing3.png"
            alt="Galería de arte"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>

        {/* Desktop: floating parallax collage */}
        <div
          ref={colRef}
          className="relative h-[72vh] max-h-175 max-md:hidden"
          onMouseMove={onColMove}
          onMouseLeave={onColLeave}
        >
          {CARDS.map((card, i) => (
            <div
              key={card.src}
              style={{
                position: 'absolute',
                zIndex: hovered === i ? 10 : card.z,
                aspectRatio: String(card.aspect),
                ...card.pos,
              }}
            >
              {/* Parallax layer — JS sets transform here */}
              <div
                ref={el => { cardRefs.current[i] = el }}
                className="w-full h-full"
                style={{ willChange: 'transform' }}
              >
                {/* Visual card */}
                <div
                  className="relative w-full h-full overflow-hidden cursor-crosshair"
                  style={{
                    boxShadow: hovered === i
                      ? '0 0 0 1px oklch(60% 0.130 82 / 0.35), 0 20px 60px oklch(14% 0.010 75 / 0.18), 0 6px 16px oklch(14% 0.010 75 / 0.10)'
                      : '0 4px 24px oklch(14% 0.010 75 / 0.13), 0 1px 4px oklch(14% 0.010 75 / 0.07)',
                    transition: 'box-shadow 0.45s ease',
                  }}
                  onMouseEnter={() => setHovered(i)}
                  onMouseMove={e => onCardMove(e, i)}
                  onMouseLeave={() => onCardLeave(i)}
                >
                  <Image
                    ref={el => { imgRefs.current[i] = el }}
                    src={card.src}
                    alt={card.alt}
                    fill
                    priority={card.priority}
                    sizes={card.sizes}
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)]"
                  />

                  {/* Bottom gradient — fades in on hover */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'linear-gradient(to top, oklch(14% 0.010 75 / 0.5) 0%, transparent 50%)',
                      opacity: hovered === i ? 1 : 0,
                      transition: 'opacity 0.4s ease',
                    }}
                  />

                  {/* Gold accent line — sweeps in from the left on hover */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
                    style={{
                      background: 'linear-gradient(to right, oklch(60% 0.130 82), oklch(68% 0.140 82 / 0))',
                      transform: hovered === i ? 'scaleX(1)' : 'scaleX(0)',
                      transformOrigin: 'left center',
                      transition: 'transform 0.55s cubic-bezier(.22,1,.36,1)',
                    }}
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Floating badge */}
          <div
            className="absolute bottom-8 -left-7 bg-bg border border-(--border) px-5 py-3.5 shadow-md flex flex-col gap-0.5 z-20"
            style={{ animation: 'fl2 7s ease-in-out infinite' }}
          >
            <span className="font-serif text-[16px] font-bold">Mariana López</span>
            <span className="text-[11px] text-ink3 tracking-[2px] uppercase">Artista · Madrid</span>
          </div>

          {/* Floating tag */}
          <div
            className="absolute top-7 -right-5 bg-gold text-bg px-4 py-2 text-[11px] font-semibold tracking-[2px] uppercase z-20"
            style={{ animation: 'fl1 9s ease-in-out infinite 1s' }}
          >
            Galería abierta
          </div>
        </div>
      </div>
    </section>
  )
}
