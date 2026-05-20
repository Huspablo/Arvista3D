import Link from 'next/link'

interface Props {
  name:     string
  artist:   string
  count:    number
  slug:     string
}

export function GalleryHero({ name, artist, count, slug }: Props) {
  return (
    <section className="border-b border-(--border) pt-18 px-15 max-md:px-6 max-md:pt-10">
      <div
        className="max-w-370 mx-auto grid items-end gap-10 pb-10 max-md:grid-cols-1"
        style={{ gridTemplateColumns: '1fr auto' }}
      >
        <div>
          <span className="text-[11px] tracking-[5px] uppercase text-gold mb-3.5 block reveal">
            Galería pública
          </span>
          <h1
            className="font-serif font-black leading-[.92] mb-4 reveal rd1"
            style={{ fontSize: 'clamp(40px, 6vw, 88px)' }}
          >
            {name}
          </h1>
          <div className="flex items-center gap-5 text-[14px] text-ink3 reveal rd2">
            <div
              className="w-8 h-8 rounded-full shrink-0 border-2 border-(--border-md)"
              style={{ background: 'radial-gradient(ellipse at 25% 75%, oklch(68% .10 300), oklch(84% .14 82))' }}
            />
            <span>
              Por{' '}
              <Link
                href="#artist"
                className="text-ink no-underline border-b border-(--border-md) hover:border-gold transition-colors"
              >
                {artist}
              </Link>
            </span>
            <span className="w-px h-3.5 bg-(--border-md)" />
            <span>{count} obras</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3 reveal rd2 max-md:hidden">
          <Link
            href={`/galleries/${slug}/viewer`}
            className="relative overflow-hidden text-[14px] px-7 py-3 rounded-xs bg-ink text-bg no-underline font-medium hover:-translate-y-px transition-all ease-[cubic-bezier(.22,1,.36,1)] group"
          >
            <span className="absolute inset-0 bg-gold -translate-x-full group-hover:translate-x-0 transition-transform duration-400 ease-[cubic-bezier(.22,1,.36,1)]" />
            <span className="relative z-1">◈ Ver en 3D</span>
          </Link>
          <Link
            href="#artist"
            className="text-[14px] px-7 py-3 border-[1.5px] border-(--border-md) rounded-xs text-ink no-underline hover:border-ink hover:-translate-y-px transition-all"
          >
            Contactar artista →
          </Link>
        </div>
      </div>
    </section>
  )
}
