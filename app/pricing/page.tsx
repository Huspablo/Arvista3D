import { Nav }          from '@/components/layout/nav'
import { Footer }        from '@/components/layout/footer'
import { ScrollReveal }  from '@/components/ui/scroll-reveal'
import { PricingPlans }  from '@/components/public/pricing-plans'

export const metadata = {
  title:       'Planes — Arvista 3D',
  description: 'Elige el plan que mejor se adapta a ti. Empieza gratis, sin tarjeta de crédito.',
}

export default function PricingPage() {
  return (
    <>
      <Nav />
      <div className="pt-14.25">

        {/* Header */}
        <section className="py-20 px-6 text-center border-b border-(--border) max-md:py-14">
          <span className="text-[10px] tracking-[6px] uppercase text-gold mb-5 block">Precios</span>
          <h1
            className="font-serif font-black leading-[.95] mb-6"
            style={{ fontSize: 'clamp(42px, 6vw, 88px)' }}
          >
            Lleva tu arte<br />
            <em className="italic text-gold">al mundo.</em>
          </h1>
          <p className="text-[16px] text-ink2 max-w-xl mx-auto leading-[1.8]">
            Sin comisiones por venta. Sin contratos. Cancela cuando quieras.
          </p>
        </section>

        {/* Pricing cards */}
        <section className="py-20 px-6 max-w-280 mx-auto max-md:py-14">
          <PricingPlans />
        </section>

        {/* Trust row */}
        <section className="py-14 px-6 border-t border-(--border) bg-bg2">
          <div className="max-w-280 mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            {[
              { icon: '◈', title: 'Viewer 3D incluido',  body: 'Todos los planes incluyen el recorrido virtual 3D sin coste adicional.' },
              { icon: '◎', title: 'Sin permanencia',     body: 'Cancela en cualquier momento. Sin letras pequeñas, sin penalizaciones.' },
              { icon: '◇', title: 'Soporte real',        body: 'Escríbenos si tienes alguna duda. Respondemos en menos de 24 h.' },
            ].map(({ icon, title, body }) => (
              <div key={title}>
                <span className="font-serif text-[36px] text-gold block mb-3">{icon}</span>
                <h3 className="font-serif font-bold text-[18px] mb-2">{title}</h3>
                <p className="text-[13px] text-ink3 leading-[1.8]">{body}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
      <Footer />
      <ScrollReveal />
    </>
  )
}
