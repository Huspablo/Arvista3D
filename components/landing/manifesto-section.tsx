export function ManifestoSection() {
  return (
    <section id="galerías" className="py-35 px-15 max-w-370 mx-auto grid grid-cols-[.85fr_1fr] gap-25 items-center max-md:grid-cols-1 max-md:gap-12 max-md:py-20 max-md:px-6">
      {/* Left */}
      <div>
        <span
          className="font-serif font-black leading-[.8] block mb-[-8px] reveal"
          style={{
            fontSize: 'clamp(100px, 14vw, 180px)',
            color: 'transparent',
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
          Diseña galerías tridimensionales que reflejen tu visión artística. Cada espacio es tuyo — curado, personalizado y listo para recibir visitantes de cualquier parte del mundo.
        </p>
      </div>

      {/* Right — mosaic */}
      <div className="grid grid-cols-2 gap-2.5 reveal rd2 max-md:hidden">
        <div className="row-span-2 border border-(--border) overflow-hidden hover:scale-[1.02] transition-transform duration-600 ease-[cubic-bezier(.22,1,.36,1)] art-p1" />
        <div className="aspect-square border border-(--border) overflow-hidden hover:scale-[1.02] transition-transform duration-600 ease-[cubic-bezier(.22,1,.36,1)] art-p5" />
        <div className="aspect-square border border-(--border) overflow-hidden hover:scale-[1.02] transition-transform duration-600 ease-[cubic-bezier(.22,1,.36,1)] art-p3" />
      </div>
    </section>
  )
}
