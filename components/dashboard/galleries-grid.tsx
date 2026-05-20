import Link from 'next/link'

const GALLERIES = [
  {
    name:       'Texturas urbanas',
    visibility: 'public' as const,
    count:      8,
    max:        10,
    art:        'art-p1',
    publicHref: '/galleries/texturas-urbanas',
  },
  {
    name:       'Agua & Forma',
    visibility: 'private' as const,
    count:      3,
    max:        10,
    art:        'art-p2',
    publicHref: null,
  },
]

const BAR_COLOR = { public: 'var(--color-ok)', private: 'var(--color-gold)' }

export function GalleriesGrid() {
  return (
    <div>
      <div className="flex items-center justify-between mb-5 reveal">
        <span className="font-serif text-[22px] font-bold">Mis galerías</span>
        <Link href="/dashboard/galleries" className="text-[13px] text-ink3 no-underline border-b border-(--border) hover:text-ink hover:border-(--border-md) transition-all">
          Ver todas →
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-10 max-md:grid-cols-2">
        {GALLERIES.map((g, i) => (
          <div
            key={g.name}
            className={`bg-bg border overflow-hidden hover:border-(--border-md) hover:shadow-md hover:-translate-y-0.75 transition-all ease-[cubic-bezier(.22,1,.36,1)] reveal ${i > 0 ? `rd${i}` : ''} border-(--border)`}
          >
            {/* Thumb */}
            <div className={`h-32.5 overflow-hidden relative`}>
              <div className={`w-full h-full transition-transform duration-600 ease-[cubic-bezier(.22,1,.36,1)] hover:scale-[1.05] ${g.art}`} />
            </div>

            {/* Body */}
            <div className="px-4.5 py-4.5 pb-3.5">
              <div className="flex items-center justify-between mb-1 gap-2">
                <span className="font-serif text-[17px] font-bold flex-1 leading-tight">{g.name}</span>
                <span
                  className={`text-[9px] tracking-[1.5px] uppercase px-2.25 py-0.75 rounded-[1px] font-medium shrink-0 border ${
                    g.visibility === 'public'
                      ? 'bg-(--ok-dim) text-ok border-[oklch(56%_0.14_155/0.2)]'
                      : 'bg-(--border) text-ink3 border-(--border)'
                  }`}
                >
                  {g.visibility === 'public' ? 'Pública' : 'Privada'}
                </span>
              </div>
              <div className="text-[12px] text-ink3 mb-2.5">{g.count} / {g.max} obras</div>
              <div className="h-0.75 bg-(--border) rounded-sm overflow-hidden">
                <div
                  className="h-full rounded-sm transition-all duration-1000 ease-[cubic-bezier(.22,1,.36,1)]"
                  style={{ width: `${(g.count / g.max) * 100}%`, background: BAR_COLOR[g.visibility] }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-1.5 px-4.5 pb-3 border-t border-(--border) pt-3">
              <button className="text-[12px] px-4 py-1.75 border border-(--border) rounded-xs text-ink3 bg-transparent hover:border-(--border-md) hover:text-ink transition-all">
                Editar
              </button>
              {g.visibility === 'public' && g.publicHref ? (
                <Link
                  href={g.publicHref}
                  className="text-[12px] px-4 py-1.75 border border-(--border) rounded-xs text-ink3 no-underline hover:border-(--border-md) hover:text-ink transition-all"
                >
                  Ver pública →
                </Link>
              ) : (
                <button className="text-[12px] px-4 py-1.75 border border-(--border) rounded-xs text-ink3 bg-transparent hover:border-(--border-md) hover:text-ink transition-all">
                  Publicar
                </button>
              )}
            </div>
          </div>
        ))}

        {/* New gallery slot */}
        <Link
          href="/dashboard/galleries/new"
          className="border-2 border-dashed border-(--border) flex flex-col items-center justify-center gap-1.5 text-ink3 hover:border-gold hover:text-gold transition-colors min-h-50 reveal rd2 no-underline"
        >
          <span className="text-[24px] opacity-40">+</span>
          <span className="text-[13px]">Nueva galería</span>
          <span className="text-[11px] text-ink3 mt-0.5">1 slot disponible</span>
        </Link>
      </div>
    </div>
  )
}
