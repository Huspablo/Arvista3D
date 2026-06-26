import Link from 'next/link'

export function CtaSection() {
  return (
    <section className="py-40 px-15 text-center relative overflow-hidden bg-bg2 max-md:py-25 max-md:px-6">
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <h2
        className="font-serif font-black leading-[.95] mb-8 relative z-1 reveal"
        style={{ fontSize: 'clamp(48px, 7vw, 108px)' }}
      >
        Empieza a<br /><em className="italic text-gold block">exponer hoy.</em>
      </h2>
      <p className="text-[17px] text-ink2 mb-12 relative z-1 reveal rd1">
        Únete a los artistas que ya llevan su obra al mundo sin límites.
      </p>
      <div className="flex gap-3 justify-center relative z-1 reveal rd2 max-md:flex-col max-md:items-center">
        <Link
          href="/dashboard"
          className="relative overflow-hidden bg-ink text-bg px-10 py-4 rounded-xs text-[15px] font-medium tracking-[0.4px] no-underline hover:-translate-y-0.5 hover:shadow-md transition-all ease-[cubic-bezier(.22,1,.36,1)] group"
        >
          <span className="absolute inset-0 bg-gold -translate-x-full group-hover:translate-x-0 transition-transform duration-450 ease-[cubic-bezier(.22,1,.36,1)]" />
          <span className="relative z-1">Crear cuenta gratis</span>
        </Link>
        <Link
          href="/pricing"
          className="bg-transparent text-ink px-10 py-4 rounded-xs border-[1.5px] border-(--border-md) text-[15px] font-light tracking-[0.4px] no-underline hover:border-ink hover:-translate-y-0.5 transition-all ease-[cubic-bezier(.22,1,.36,1)]"
        >
          Ver planes
        </Link>
      </div>
      <p className="text-[13px] text-ink3 mt-5 relative z-1 reveal rd3">
        Sin tarjeta de crédito · Plan gratuito disponible
      </p>
    </section>
  )
}
