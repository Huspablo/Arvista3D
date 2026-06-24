import Link from 'next/link'

interface Props {
  artistId:     string
  name:         string
  bio:          string
  avatarUrl:    string | null
  website:      string | null
  artworkCount: number
  memberSince?: Date
}

export function ArtistBar({ artistId, name, bio, avatarUrl, website, artworkCount, memberSince }: Props) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'

  return (
    <section id="artist" className="bg-ink py-15 px-15 max-md:px-6">
      <div className="max-w-370 mx-auto flex items-center gap-10 max-md:flex-col max-md:items-start">

        {/* Avatar */}
        <div
          className="w-20 h-20 rounded-full shrink-0 border-[3px] overflow-hidden flex items-center justify-center"
          style={{ borderColor: 'oklch(100% 0 0 / .15)' }}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center font-serif font-bold text-[22px]"
              style={{
                background: 'radial-gradient(ellipse at 25% 75%, oklch(68% .10 300), oklch(84% .14 82))',
                color:      'oklch(94% 0.008 75)',
              }}
            >
              {initials}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <span
            className="text-[10px] tracking-[4px] uppercase mb-2 block"
            style={{ color: 'oklch(100% 0 0 / .35)' }}
          >
            Artista
          </span>
          <Link
            href={`/artists/${artistId}`}
            className="font-serif font-bold mb-2 no-underline hover:opacity-80 transition-opacity block"
            style={{ fontSize: 'clamp(22px, 3vw, 36px)', color: 'oklch(94% 0.008 75)' }}
          >
            {name}
          </Link>
          {bio && (
            <p
              className="text-[15px] leading-[1.7] max-w-140"
              style={{ color: 'oklch(100% 0 0 / .45)' }}
            >
              {bio}
            </p>
          )}
          <div className="flex gap-8 mt-6">
            <div>
              <div className="font-serif text-[28px] font-black" style={{ color: 'oklch(94% 0.008 75)' }}>
                {artworkCount}
              </div>
              <div className="text-[12px] tracking-[2px] uppercase" style={{ color: 'oklch(100% 0 0 / .35)' }}>
                Obra{artworkCount !== 1 ? 's' : ''}
              </div>
            </div>
            {memberSince && (
              <div>
                <div className="font-serif text-[28px] font-black" style={{ color: 'oklch(94% 0.008 75)' }}>
                  {new Date(memberSince).getFullYear()}
                </div>
                <div className="text-[12px] tracking-[2px] uppercase" style={{ color: 'oklch(100% 0 0 / .35)' }}>
                  Miembro desde
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        {website && (
          <div className="shrink-0 max-md:w-full">
            <Link
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-[14px] px-8 py-4 border border-gold text-gold no-underline rounded-xs hover:bg-(--gold-dim) transition-colors max-md:w-full max-md:text-center"
            >
              Visitar sitio web →
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
