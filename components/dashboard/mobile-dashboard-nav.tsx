'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ITEMS = [
  { href: '/dashboard',           icon: '◈', label: 'Inicio'   },
  { href: '/dashboard/galleries', icon: '◻', label: 'Galerías' },
  { href: '/dashboard/artworks',  icon: '◇', label: 'Obras'    },
  { href: '/dashboard/profile',   icon: '○', label: 'Perfil'   },
  { href: '/dashboard/plan',      icon: '◎', label: 'Plan'     },
]

export function MobileDashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-ink border-t border-white/10 flex z-50">
      {ITEMS.map(item => {
        const active =
          pathname === item.href ||
          (item.href !== '/dashboard' && pathname.startsWith(item.href))
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center gap-1 py-3 no-underline transition-colors ${
              active ? 'text-gold' : 'text-white/40 hover:text-white/70'
            }`}
          >
            <span className="text-[18px] leading-none">{item.icon}</span>
            <span className="text-[9px] tracking-[1px] uppercase">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
