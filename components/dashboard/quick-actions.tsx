import Link from 'next/link'

const ACTIONS = [
  { href: '/dashboard/artworks/new', icon: '+', label: 'Nueva obra',   sub: 'Subir & publicar' },
  { href: '/dashboard/galleries',    icon: '◻', label: 'Ver galería',  sub: 'Vista pública'    },
  { href: '/dashboard/plan',         icon: '◎', label: 'Mejorar plan', sub: 'Más galerías'     },
]

export function QuickActions() {
  return (
    <div>
      <div className="flex items-center justify-between mb-5 reveal">
        <span className="font-serif text-[22px] font-bold">Acciones rápidas</span>
      </div>
      <div className="grid grid-cols-3 gap-2 reveal rd1">
        {ACTIONS.map(a => (
          <Link
            key={a.href}
            href={a.href}
            className="flex items-center gap-3 p-4 border border-(--border) bg-bg no-underline text-ink hover:border-(--border-md) hover:bg-bg2 hover:-translate-y-px transition-all ease-[cubic-bezier(.22,1,.36,1)]"
          >
            <div className="w-9 h-9 border border-(--border) flex items-center justify-center text-[16px] shrink-0">
              {a.icon}
            </div>
            <div>
              <div className="text-[14px] font-normal leading-[1.3]">{a.label}</div>
              <div className="text-[11px] text-ink3 mt-px">{a.sub}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
