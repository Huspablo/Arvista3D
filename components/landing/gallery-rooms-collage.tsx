import Link from 'next/link'

export function GalleryRoomsCollage() {
  return (
    <section className="px-15 pb-28 max-w-370 mx-auto max-md:px-6 max-md:pb-16">

      {/* Header */}
      <div className="flex items-end justify-between border-b border-(--border) pb-7 mb-10 reveal">
        <div>
          <span className="text-[11px] tracking-[6px] uppercase text-gold mb-3 block">Espacios</span>
          <h2
            className="font-serif font-black leading-[.95]"
            style={{ fontSize: 'clamp(28px, 3.5vw, 48px)' }}
          >
            Cada galería, <em className="italic text-gold">única</em>
          </h2>
        </div>
        <Link
          href="/galleries"
          className="text-ink3 text-[13px] tracking-[2px] uppercase no-underline border-b border-(--border-md) pb-0.5 hover:text-ink transition-colors max-md:hidden"
        >
          Ver galerías →
        </Link>
      </div>

      {/* 2 room preview cards */}
      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">

        {/* ── Sala Oscura ────────────────────────────────────────────────── */}
        <div
          className="reveal rd1 relative overflow-hidden rounded-xs"
          style={{ background: '#09070d', aspectRatio: '4/3' }}
        >
          {/* Ceiling shadow */}
          <div
            className="absolute inset-x-0 top-0 pointer-events-none"
            style={{ height: '14%', background: 'linear-gradient(to bottom, rgba(0,0,0,0.65), transparent)' }}
          />

          {/* Wall–floor line */}
          <div
            className="absolute inset-x-0 pointer-events-none"
            style={{ bottom: '22%', height: '1px', background: '#2a2038' }}
          />

          {/* Floor */}
          <div
            className="absolute inset-x-0 bottom-0 pointer-events-none"
            style={{ height: '22%', background: 'linear-gradient(to top, #0e0816, #09070d)' }}
          />

          {/* obra_14 — cyberpunk city (landscape), hero piece */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/preview/obra-14.jpg"
            alt="Noche urbana"
            style={{
              position:  'absolute',
              width:     '60%',
              top:       '10%',
              left:      '50%',
              transform: 'translateX(-50%)',
              border:    '2.5px solid #201830',
              boxShadow: '0 0 55px rgba(110,30,200,0.22), 0 18px 44px rgba(0,0,0,0.97)',
            }}
          />

          {/* obra_15 — river figure, secondary left */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/preview/obra-15.webp"
            alt="Figura sobre río"
            style={{
              position:  'absolute',
              width:     '23%',
              top:       '22%',
              left:      '4%',
              border:    '2px solid #201830',
              boxShadow: '0 8px 28px rgba(0,0,0,0.97)',
            }}
          />

          {/* Vignette overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 34%, transparent 32%, rgba(0,0,0,0.62) 100%)' }}
          />

          {/* Label */}
          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
            <div>
              <p
                className="font-serif font-bold text-[15px] leading-tight"
                style={{ color: 'rgba(238,228,255,0.95)' }}
              >
                Sala Oscura
              </p>
              <p
                className="text-[10px] tracking-[1.5px] mt-0.5"
                style={{ color: 'rgba(185,158,255,0.46)' }}
              >
                ATMÓSFERA ÍNTIMA · LUZ PUNTUAL
              </p>
            </div>
            <span
              className="font-serif text-[22px] leading-none"
              style={{ color: 'rgba(165,110,255,0.4)' }}
            >
              ◈
            </span>
          </div>
        </div>

        {/* ── Galería Contemporánea ───────────────────────────────────────── */}
        <div
          className="reveal rd2 relative overflow-hidden rounded-xs"
          style={{ background: '#f2ede6', aspectRatio: '4/3' }}
        >
          {/* Ceiling shadow */}
          <div
            className="absolute inset-x-0 top-0 pointer-events-none"
            style={{ height: '10%', background: 'linear-gradient(to bottom, rgba(0,0,0,0.065), transparent)' }}
          />

          {/* Wall–floor line */}
          <div
            className="absolute inset-x-0 pointer-events-none"
            style={{ bottom: '22%', height: '1px', background: '#cdc7be' }}
          />

          {/* Floor */}
          <div
            className="absolute inset-x-0 bottom-0 pointer-events-none"
            style={{ height: '22%', background: 'linear-gradient(to top, #e0d9ce, #f2ede6)' }}
          />

          {/* obra_1 — fantasy landscape, hero piece left */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/preview/obra-1.jpg"
            alt="Paisaje fantástico"
            style={{
              position:  'absolute',
              width:     '56%',
              top:       '8%',
              left:      '4%',
              border:    '3px solid #1a1510',
              boxShadow: '5px 8px 24px rgba(0,0,0,0.22)',
            }}
          />

          {/* obra_32 — samurai, portrait right */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/preview/obra-32.jpg"
            alt="Samurai"
            style={{
              position:  'absolute',
              width:     '28%',
              top:       '8%',
              right:     '4%',
              border:    '3px solid #1a1510',
              boxShadow: '4px 6px 18px rgba(0,0,0,0.18)',
            }}
          />

          {/* Vignette overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 34%, transparent 44%, rgba(0,0,0,0.10) 100%)' }}
          />

          {/* Label */}
          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
            <div>
              <p
                className="font-serif font-bold text-[15px] leading-tight"
                style={{ color: '#1a1510' }}
              >
                Galería Contemporánea
              </p>
              <p
                className="text-[10px] tracking-[1.5px] mt-0.5"
                style={{ color: '#9e9284' }}
              >
                LUZ NATURAL · ESPACIO ABIERTO
              </p>
            </div>
            <span
              className="font-serif text-[22px] leading-none"
              style={{ color: 'rgba(178,138,44,0.38)' }}
            >
              ◈
            </span>
          </div>
        </div>

      </div>
    </section>
  )
}
