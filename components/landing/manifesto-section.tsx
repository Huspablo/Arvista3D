'use client'

import dynamic from 'next/dynamic'

const GalleryPreview3D = dynamic(
  () => import('./gallery-preview-3d').then(m => ({ default: m.GalleryPreview3D })),
  {
    ssr:     false,
    loading: () => <div className="w-full h-full art-p1" />,
  },
)

export function ManifestoSection() {
  return (
    <section
      id="galerías"
      className="py-35 px-15 max-w-370 mx-auto grid grid-cols-[1fr_.85fr] gap-25 items-center max-md:grid-cols-1 max-md:gap-12 max-md:py-20 max-md:px-6"
    >
      {/* ── Left: live 3D gallery preview ── */}
      <div
        className="reveal rd1 max-md:hidden overflow-hidden border border-(--border) rounded-xs"
        style={{ aspectRatio: '4 / 5' }}
      >
        <GalleryPreview3D />
      </div>

      {/* ── Right: copy ── */}
      <div>
        <span
          className="font-serif font-black leading-[.8] block -mb-2 reveal"
          style={{
            fontSize:         'clamp(100px, 14vw, 180px)',
            color:            'transparent',
            WebkitTextStroke: '1px var(--border-md)',
          }}
        >
          01
        </span>
        <span className="text-[11px] tracking-[6px] uppercase text-gold mb-5 block reveal rd1">
          Galerías
        </span>
        <h2
          className="font-serif font-bold leading-[1.1] mb-7 reveal rd1"
          style={{ fontSize: 'clamp(32px, 4vw, 54px)' }}
        >
          Tu espacio.<br /><em className="italic text-gold">Tu identidad.</em>
        </h2>
        <p className="text-[17px] leading-[1.85] text-ink2 max-w-100 reveal rd2">
          Diseña galerías tridimensionales que reflejen tu visión artística. Cada espacio es tuyo —
          curado, personalizado y listo para recibir visitantes de cualquier parte del mundo.
        </p>
      </div>
    </section>
  )
}
