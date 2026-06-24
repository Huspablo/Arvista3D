'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useClerk } from '@clerk/nextjs'
import { useArtist } from '@/lib/hooks/use-artist'
import { useGalleries } from '@/lib/hooks/use-galleries'
import { useArtworks } from '@/lib/hooks/use-artworks'
import { PLAN_LIMITS } from '@/lib/services/artist.service'

const PLAN_LABEL = { BASIC: 'Básico', STANDARD: 'Estándar', PREMIUM: 'Premium' } as const

const NAV = [
  {
    section: 'Principal',
    items: [
      { href: '/dashboard',           icon: '◈', label: 'Dashboard' },
      { href: '/dashboard/galleries', icon: '◻', label: 'Galerías'  },
      { href: '/dashboard/artworks',  icon: '◇', label: 'Obras'     },
    ],
  },
  {
    section: 'Cuenta',
    items: [
      { href: '/dashboard/profile', icon: '○', label: 'Mi perfil'        },
      { href: '/dashboard/plan',    icon: '◎', label: 'Mi plan'          },
      { href: '/',                  icon: '↗', label: 'Ver sitio público' },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { signOut } = useClerk()

  const { data: artist }    = useArtist()
  const { data: galleries } = useGalleries()
  const { data: artworks }  = useArtworks()

  const plan          = artist?.plan ?? 'BASIC'
  const limits        = PLAN_LIMITS[plan]
  const galleryCount  = galleries?.length ?? 0
  // Badge muestra total de obras (no solo expuestas) — el límite es por exposición, no por creación
  const totalArtworks = artworks?.length ?? 0
  const exposedCount  = artworks?.filter(a => a.status === 'EXPOSED').length ?? 0

  const badges: Record<string, { label: string; warn?: boolean }> = {
    '/dashboard/galleries': { label: String(galleryCount) },
    '/dashboard/artworks':  { label: String(totalArtworks) },
  }

  const totalCapacity = limits.galleries * limits.artworksPerGallery
  const usagePercent  = totalCapacity > 0
    ? Math.round((exposedCount / totalCapacity) * 100)
    : 0

  return (
    <aside className="h-full bg-ink flex flex-col border-r border-white/6">
      {/* Logo */}
      <div className="px-7 py-7 border-b border-white/8 flex items-center gap-2.5">
        <Link href="/" className="font-serif text-[19px] font-bold text-[oklch(94%_0.008_75)] no-underline">
          Arvista <span className="text-gold">3D</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-5 flex flex-col overflow-y-auto">
        {NAV.map(group => (
          <div key={group.section}>
            <span className="text-[9px] tracking-[4px] uppercase text-white/[0.28] px-7 py-4 pt-4 pb-2 block">
              {group.section}
            </span>
            {group.items.map(item => {
              const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
              const badge  = badges[item.href]
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-7 py-3 text-[14px] no-underline transition-colors relative group ${
                    active ? 'text-[oklch(94%_0.008_75)]' : 'text-white/45 hover:text-[oklch(94%_0.008_75)] hover:bg-white/4'
                  }`}
                >
                  {active && <span className="absolute left-0 top-0 bottom-0 w-0.75 bg-gold" />}
                  <span className={`w-4.5 h-4.5 flex items-center justify-center text-[14px] shrink-0 transition-opacity ${active ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
                    {item.icon}
                  </span>
                  {item.label}
                  {badge && (
                    <span className="ml-auto text-[10px] px-2 py-0.5 rounded-[10px] bg-white/8 text-white/45">
                      {badge.label}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Plan card */}
      <div className="p-6 border-t border-white/8">
        <div className="bg-white/4 border border-white/8 rounded-[3px] p-4">
          <div className="text-[10px] tracking-[3px] uppercase text-white/30 mb-1.5">Plan actual</div>
          <div className="font-serif text-[18px] font-bold text-gold mb-3.5">
            {PLAN_LABEL[plan]}
          </div>
          <div className="h-1 bg-white/10 rounded-sm mb-2">
            <div
              className="h-full rounded-sm bg-gold transition-all duration-800 ease-[cubic-bezier(.22,1,.36,1)]"
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
          <div className="text-[12px] text-white/35">
            {exposedCount} de {totalCapacity} obras expuestas
          </div>
          <Link
            href="/dashboard/plan"
            className="block mt-3.5 text-center text-[12px] font-medium tracking-[1px] text-gold no-underline border border-(--gold-line) py-2 rounded-xs hover:bg-(--gold-dim) transition-colors"
          >
            Mejorar plan →
          </Link>
        </div>
      </div>

      {/* Logout */}
      <div className="px-6 py-4 border-t border-white/8">
        <button
          onClick={() => signOut({ redirectUrl: '/' })}
          className="w-full text-left flex items-center gap-3 px-1 py-2 text-[13px] text-white/30 hover:text-white/60 transition-colors group"
        >
          <span className="w-4.5 h-4.5 flex items-center justify-center text-[14px] shrink-0 opacity-60 group-hover:opacity-100">↙</span>
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
