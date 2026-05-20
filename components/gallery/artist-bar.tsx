import Link from 'next/link'

interface Props {
  artist: string
}

export function ArtistBar({ artist }: Props) {
  return (
    <section id="artist" className="bg-ink py-15 px-15 max-md:px-6">
      <div className="max-w-370 mx-auto flex items-center gap-10 max-md:flex-col max-md:items-start">

        {/* Avatar */}
        <div
          className="w-20 h-20 rounded-full shrink-0 border-[3px]"
          style={{
            background:   'radial-gradient(ellipse at 25% 75%, oklch(68% .10 300), oklch(84% .14 82))',
            borderColor:  'oklch(100% 0 0 / .15)',
          }}
        />

        {/* Info */}
        <div className="flex-1">
          <span
            className="text-[10px] tracking-[4px] uppercase mb-2 block"
            style={{ color: 'oklch(100% 0 0 / .35)' }}
          >
            Artista
          </span>
          <h2
            className="font-serif font-bold mb-2"
            style={{ fontSize: 'clamp(22px, 3vw, 36px)', color: 'oklch(94% 0.008 75)' }}
          >
            {artist}
          </h2>
          <p
            className="text-[15px] leading-[1.7] max-w-140"
            style={{ color: 'oklch(100% 0 0 / .45)' }}
          >
            Artista multidisciplinar con base en Madrid. Su trabajo explora la intersección entre
            la forma, el espacio y la materia, dialogando con tradiciones escultóricas y lenguajes
            fotográficos contemporáneos.
          </p>
          <div className="flex gap-8 mt-6">
            {[['8', 'Obras'], ['1', 'Galería pública']].map(([val, label]) => (
              <div key={label}>
                <div
                  className="font-serif text-[28px] font-black"
                  style={{ color: 'oklch(94% 0.008 75)' }}
                >
                  {val}
                </div>
                <div
                  className="text-[12px] tracking-[2px] uppercase"
                  style={{ color: 'oklch(100% 0 0 / .35)' }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="shrink-0 max-md:w-full">
          <Link
            href="/contact"
            className="inline-block text-[14px] px-8 py-4 border border-gold text-gold no-underline rounded-xs hover:bg-(--gold-dim) transition-colors"
          >
            Contactar artista →
          </Link>
        </div>
      </div>
    </section>
  )
}
