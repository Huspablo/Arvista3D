'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PLANS } from '@/lib/plans'

export function PricingPlans() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')

  return (
    <div>
      {/* Billing toggle */}
      <div className="flex items-center gap-4 mb-10">
        <div className="flex border border-(--border) text-[12px]">
          {(['monthly', 'annual'] as const).map(b => (
            <button
              key={b}
              type="button"
              onClick={() => setBilling(b)}
              className={`px-5 py-1.75 transition-colors ${
                billing === b ? 'bg-ink text-bg' : 'bg-transparent text-ink3 hover:text-ink'
              }`}
            >
              {b === 'monthly' ? 'Mensual' : 'Anual · −20%'}
            </button>
          ))}
        </div>
        {billing === 'annual' && (
          <span className="text-[11px] text-ok">Ahorra hasta 70€/año</span>
        )}
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {PLANS.map((plan) => {
          const price = billing === 'annual' ? Math.round(plan.price * 0.8) : plan.price

          return (
            <div
              key={plan.key}
              className={`relative border flex flex-col ${
                plan.key === 'estandar'
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
                  <div className="flex flex-col gap-0.5 mt-1">
                    <p className="text-[11px] text-ok">
                      {Math.round(plan.price * 0.2 * 12)}€ ahorrados al año
                    </p>
                    <p className="text-[11px] text-ink3">
                      Facturado anualmente · {price * 12}€/año
                    </p>
                  </div>
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
                <Link
                  href={plan.price === 0 ? '/dashboard' : '/dashboard/plan'}
                  className={`block w-full text-center text-[13px] py-3 font-medium rounded-xs transition-all ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-px no-underline ${
                    plan.key === 'estandar'
                      ? 'bg-gold text-bg hover:bg-gold-hi'
                      : 'bg-ink text-bg hover:bg-ink2'
                  }`}
                >
                  {plan.price === 0 ? 'Empezar gratis' : `Empezar con ${plan.label}`}
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-[12px] text-ink3 text-center leading-[1.9]">
        Sin tarjeta de crédito para el plan Básico · Cancela cuando quieras
        <br />
        <Link href="/dashboard/plan" className="text-ink3 underline hover:text-ink transition-colors">
          ¿Ya tienes cuenta? Gestiona tu plan desde el dashboard →
        </Link>
      </p>
    </div>
  )
}
