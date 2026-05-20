'use client'

import { useState } from 'react'

const PLANS = [
  {
    key:      'basico',
    label:    'Básico',
    price:    0,
    period:   'gratis',
    galleries: 1,
    artworks:  10,
    viewer3d:  true,
    analytics: false,
    priority:  false,
    features: [
      '1 galería pública',
      'Hasta 10 obras por galería',
      'Viewer 3D incluido',
      'Dominio arvista.art/galleries/…',
    ],
  },
  {
    key:      'estandar',
    label:    'Estándar',
    price:    12,
    period:   '/ mes',
    galleries: 2,
    artworks:  20,
    viewer3d:  true,
    analytics: true,
    priority:  false,
    features: [
      '2 galerías públicas',
      'Hasta 20 obras por galería',
      'Viewer 3D incluido',
      'Analítica de visitas',
      'Eliminar marca de agua',
    ],
  },
  {
    key:      'premium',
    label:    'Premium',
    price:    29,
    period:   '/ mes',
    galleries: 3,
    artworks:  50,
    viewer3d:  true,
    analytics: true,
    priority:  true,
    features: [
      '3 galerías públicas',
      'Hasta 50 obras por galería',
      'Viewer 3D incluido',
      'Analítica avanzada',
      'Soporte prioritario',
      'Dominio personalizado (próx.)',
    ],
  },
]

const CURRENT_PLAN = 'basico'

// Mock usage
const USAGE = {
  galleries: { used: 1,  max: 1  },
  artworks:  { used: 8,  max: 10 },
}

const INVOICES = [
  { date: 'Apr 2026', amount: '—',    status: 'Activo'   },
  { date: 'Mar 2026', amount: '—',    status: 'Activo'   },
]

export function PlanManager() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')

  const currentPlan = PLANS.find(p => p.key === CURRENT_PLAN)!

  return (
    <div>

      {/* Current usage */}
      <div className="mb-10 p-6 border border-(--border) bg-bg2 reveal">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[10px] tracking-[3px] uppercase text-ink3 mb-1.5">Plan actual</p>
            <p className="font-serif text-[26px] font-black">{currentPlan.label}</p>
          </div>
          <span className="text-[9px] tracking-[2px] uppercase px-2.5 py-1 bg-(--ok-dim) text-ok border border-[oklch(56%_0.14_155/0.2)]">
            Activo
          </span>
        </div>

        <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
          {[
            { label: 'Galerías',       used: USAGE.galleries.used, max: USAGE.galleries.max },
            { label: 'Obras (galería más llena)', used: USAGE.artworks.used,  max: USAGE.artworks.max  },
          ].map(u => (
            <div key={u.label}>
              <div className="flex justify-between text-[12px] mb-2">
                <span className="text-ink3">{u.label}</span>
                <span className="text-ink font-medium">{u.used} / {u.max}</span>
              </div>
              <div className="h-1 bg-(--border) rounded-sm overflow-hidden">
                <div
                  className="h-full rounded-sm transition-all duration-1000 ease-[cubic-bezier(.22,1,.36,1)]"
                  style={{
                    width:      `${(u.used / u.max) * 100}%`,
                    background: u.used >= u.max ? 'var(--color-warn)' : 'var(--color-ok)',
                  }}
                />
              </div>
              {u.used >= u.max && (
                <p className="text-[11px] text-warn mt-1.25">Límite alcanzado — mejora tu plan para añadir más</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Billing toggle */}
      <div className="flex items-center gap-3 mb-6 reveal rd1">
        <span className="text-[13px] font-medium">Planes</span>
        <div className="flex border border-(--border) text-[12px]">
          {(['monthly', 'annual'] as const).map(b => (
            <button
              key={b}
              type="button"
              onClick={() => setBilling(b)}
              className={`px-4 py-1.5 transition-colors ${
                billing === b
                  ? 'bg-ink text-bg'
                  : 'bg-transparent text-ink3 hover:text-ink'
              }`}
            >
              {b === 'monthly' ? 'Mensual' : 'Anual · −20%'}
            </button>
          ))}
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid gap-4 mb-12 max-md:grid-cols-1 reveal rd2" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {PLANS.map((plan) => {
          const isCurrent = plan.key === CURRENT_PLAN
          const price     = billing === 'annual' ? Math.round(plan.price * 0.8) : plan.price

          return (
            <div
              key={plan.key}
              className={`relative border flex flex-col ${
                isCurrent
                  ? 'border-ink bg-bg2'
                  : plan.key === 'estandar'
                    ? 'border-gold bg-(--gold-dim)'
                    : 'border-(--border) bg-bg'
              }`}
            >
              {plan.key === 'estandar' && (
                <div className="absolute top-0 inset-x-0 h-0.5 bg-gold" />
              )}
              {plan.key === 'estandar' && (
                <span className="absolute -top-2.75 left-1/2 -translate-x-1/2 bg-gold text-bg text-[9px] tracking-[2px] uppercase px-3 py-0.75 font-medium">
                  Popular
                </span>
              )}

              <div className="p-6 border-b border-(--border)">
                <p className="text-[10px] tracking-[3px] uppercase text-ink3 mb-2">{plan.label}</p>
                <div className="flex items-baseline gap-1 mb-1">
                  {plan.price === 0 ? (
                    <span className="font-serif text-[32px] font-black">Gratis</span>
                  ) : (
                    <>
                      <span className="font-serif text-[32px] font-black">{price}€</span>
                      <span className="text-[13px] text-ink3">{plan.period}</span>
                    </>
                  )}
                </div>
                {billing === 'annual' && plan.price > 0 && (
                  <p className="text-[11px] text-ok">
                    {Math.round(plan.price * 0.2 * 12)}€ ahorrados al año
                  </p>
                )}
              </div>

              <div className="p-6 flex-1">
                <ul className="flex flex-col gap-2.5">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-[13px]">
                      <span className={`mt-0.5 shrink-0 text-[11px] ${plan.key === 'estandar' ? 'text-gold' : 'text-ok'}`}>◈</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-6 pt-0">
                {isCurrent ? (
                  <div className="text-center text-[12px] text-ink3 py-3 border border-(--border)">
                    Plan actual
                  </div>
                ) : (
                  <button
                    type="button"
                    className={`w-full relative overflow-hidden text-[13px] py-3 font-medium transition-all ease-[cubic-bezier(.22,1,.36,1)] group hover:-translate-y-px ${
                      plan.key === 'estandar'
                        ? 'bg-gold text-bg hover:bg-gold-hi'
                        : 'bg-ink text-bg hover:bg-ink2'
                    }`}
                  >
                    {plan.price === 0 ? 'Cambiar a Básico' : `Mejorar a ${plan.label}`}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Billing history */}
      <section className="reveal rd3">
        <h2 className="font-serif text-[20px] font-bold mb-5">Historial de facturación</h2>
        <div className="border border-(--border)">
          <div className="grid text-[10px] tracking-[2px] uppercase text-ink3 px-5 py-3 border-b border-(--border) bg-bg2"
            style={{ gridTemplateColumns: '1fr 1fr 1fr auto' }}>
            <span>Período</span>
            <span>Plan</span>
            <span>Importe</span>
            <span>Estado</span>
          </div>
          {INVOICES.map((inv) => (
            <div
              key={inv.date}
              className="grid items-center px-5 py-4 text-[13px] border-b border-(--border) last:border-b-0"
              style={{ gridTemplateColumns: '1fr 1fr 1fr auto' }}
            >
              <span className="text-ink">{inv.date}</span>
              <span className="text-ink3">Básico</span>
              <span className="text-ink3">{inv.amount}</span>
              <span className="text-[11px] px-2 py-0.5 bg-(--ok-dim) text-ok border border-[oklch(56%_0.14_155/0.2)]">
                {inv.status}
              </span>
            </div>
          ))}
          {INVOICES.length === 0 && (
            <div className="px-5 py-8 text-[13px] text-ink3 text-center">Sin facturas aún</div>
          )}
        </div>
        <p className="text-[12px] text-ink3 mt-3">Las facturas se envían automáticamente al email de tu cuenta.</p>
      </section>
    </div>
  )
}
