'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface NavProps {
  transparent?: boolean
}

export function Nav({ transparent = false }: NavProps) {
  const [scrolled, setScrolled] = useState(!transparent)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!transparent) return
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [transparent])

  const close = () => setMenuOpen(false)

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-200 flex items-center justify-between transition-all duration-450 ease-[cubic-bezier(.22,1,.36,1)]"
        style={{
          padding: scrolled ? '16px 60px' : '32px 60px',
          background: scrolled ? 'oklch(97.5% 0.007 75 / 0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(24px) saturate(1.4)' : 'none',
          borderBottom: `1px solid ${scrolled ? 'var(--border)' : 'transparent'}`,
          boxShadow: scrolled ? 'var(--shadow-sm)' : 'none',
        }}
      >
        <Link href="/" className="font-serif text-[20px] font-bold text-ink no-underline hover:opacity-70 transition-opacity">
          Arvista <span className="text-gold">3D</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex gap-9 items-center">
          {[
            { href: '/#obras',     label: 'Obras' },
            { href: '/#galerías',  label: 'Galerías' },
            { href: '/#artistas',  label: 'Artistas' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-ink3 text-[14px] font-normal tracking-[0.3px] no-underline hover:text-ink transition-colors relative group"
            >
              {label}
              <span className="absolute bottom-[-2px] left-0 w-0 h-px bg-gold group-hover:w-full transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)]" />
            </Link>
          ))}
          <Link
            href="/dashboard"
            className="bg-ink text-bg px-6.5 py-2.5 rounded-xs text-[14px] font-medium no-underline hover:bg-ink2 hover:-translate-y-px transition-all"
          >
            Entrar
          </Link>
        </div>

        {/* Hamburger */}
        <button
          className="flex md:hidden flex-col justify-center gap-1.25 w-10 h-10 bg-transparent border-none p-1.5 z-300"
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Abrir menú"
          aria-expanded={menuOpen}
        >
          <span className={`block h-[1.5px] rounded-sm bg-ink origin-center transition-all duration-350 ease-[cubic-bezier(.22,1,.36,1)] w-5.5 ${menuOpen ? 'translate-y-[6.5px] rotate-45' : ''}`} />
          <span className={`block h-[1.5px] rounded-sm bg-ink w-4 transition-all duration-250 ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
          <span className={`block h-[1.5px] rounded-sm bg-ink origin-center transition-all duration-350 ease-[cubic-bezier(.22,1,.36,1)] w-5.5 ${menuOpen ? '-translate-y-[6.5px] -rotate-45' : ''}`} />
        </button>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-250 flex flex-col bg-bg px-10 transition-opacity duration-400 ease-[cubic-bezier(.22,1,.36,1)] md:hidden ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!menuOpen}
      >
        <div className="flex flex-col justify-center h-full">
          <p
            className="text-[10px] tracking-[4px] uppercase text-ink3 mb-8 transition-all duration-400"
            style={{
              opacity: menuOpen ? 1 : 0,
              transform: menuOpen ? 'none' : 'translateY(12px)',
              transitionDelay: '60ms',
            }}
          >
            Menú
          </p>
          {[
            { href: '/#obras',    label: 'Obras' },
            { href: '/#galerías', label: 'Galerías' },
            { href: '/#artistas', label: 'Artistas' },
            { href: '/dashboard', label: 'Mi cuenta' },
          ].map(({ href, label }, i) => (
            <Link
              key={href}
              href={href}
              onClick={close}
              className="font-serif font-bold text-ink2 no-underline border-b border-(--border) py-5.5 flex items-center justify-between hover:text-ink transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)]"
              style={{
                fontSize: 'clamp(34px, 9vw, 54px)',
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? 'none' : 'translateY(20px)',
                transitionDelay: `${0.08 * (i + 1)}s`,
              }}
            >
              {label}
              <em className="not-italic text-[16px] text-ink3">→</em>
            </Link>
          ))}
          <Link
            href="/dashboard"
            onClick={close}
            className="mt-10 self-start bg-ink text-bg px-11 py-4 rounded-xs text-[15px] font-medium no-underline hover:bg-ink2 transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)]"
            style={{
              opacity: menuOpen ? 1 : 0,
              transform: menuOpen ? 'none' : 'translateY(20px)',
              transitionDelay: '0.32s',
            }}
          >
            Explorar obras
          </Link>
        </div>
      </div>
    </>
  )
}
