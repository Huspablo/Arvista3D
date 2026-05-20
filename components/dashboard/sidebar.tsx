'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  {
    section: 'Principal',
    items: [
      { href: '/dashboard',           icon: '◈', label: 'Dashboard' },
      { href: '/dashboard/galleries', icon: '◻', label: 'Galerías',  badge: '2' },
      { href: '/dashboard/artworks',  icon: '◇', label: 'Obras',     badge: '10/10', badgeWarn: true },
    ],
  },
  {
    section: 'Cuenta',
    items: [
      { href: '/dashboard/profile', icon: '○', label: 'Mi perfil' },
      { href: '/dashboard/plan',    icon: '◎', label: 'Mi plan' },
      { href: '/',                  icon: '↗', label: 'Ver sitio público' },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="sticky top-0 h-screen bg-ink flex flex-col border-r border-white/[0.06]">
      {/* Logo */}
      <div className="px-7 py-7 border-b border-white/[0.08] flex items-center gap-2.5">
        <Link href="/" className="font-serif text-[19px] font-bold text-[oklch(94%_0.008_75)] no-underline">
          Arvista <span className="text-gold">3D</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-5 flex flex-col">
        {NAV.map(group => (
          <div key={group.section}>
            <span className="text-[9px] tracking-[4px] uppercase text-white/[0.28] px-7 py-4 pt-4 pb-2 block">
              {group.section}
            </span>
            {group.items.map(item => {
              const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-7 py-3 text-[14px] no-underline transition-colors relative group ${
                    active ? 'text-[oklch(94%_0.008_75)]' : 'text-white/45 hover:text-[oklch(94%_0.008_75)] hover:bg-white/[0.04]'
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-0 bottom-0 w-0.75 bg-gold" />
                  )}
                  <span className={`w-4.5 h-4.5 flex items-center justify-center text-[14px] shrink-0 transition-opacity ${active ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
                    {item.icon}
                  </span>
                  {item.label}
                  {item.badge && (
                    <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-[10px] ${
                      item.badgeWarn
                        ? 'bg-(--warn-dim) text-warn'
                        : 'bg-white/[0.08] text-white/45'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Plan card */}
      <div className="p-6 border-t border-white/[0.08]">
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-[3px] p-4">
          <div className="text-[10px] tracking-[3px] uppercase text-white/30 mb-1.5">Plan actual</div>
          <div className="font-serif text-[18px] font-bold text-gold mb-3.5">Básico</div>
          <div className="h-1 bg-white/10 rounded-sm mb-2">
            <div className="h-full rounded-sm bg-gold transition-all duration-800 ease-[cubic-bezier(.22,1,.36,1)]" style={{ width: '80%' }} />
          </div>
          <div className="text-[12px] text-white/35">8 de 10 obras usadas</div>
          <Link
            href="/dashboard/plan"
            className="block mt-3.5 text-center text-[12px] font-medium tracking-[1px] text-gold no-underline border border-(--gold-line) py-2 rounded-xs hover:bg-(--gold-dim) transition-colors"
          >
            Mejorar plan →
          </Link>
        </div>
      </div>
    </aside>
  )
}
