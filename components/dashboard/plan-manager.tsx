'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useArtist } from '@/lib/hooks/use-artist'
import { useGalleries } from '@/lib/hooks/use-galleries'
import { useArtworks } from '@/lib/hooks/use-artworks'
import { PLAN_LIMITS } from '@/lib/services/artist.service'

type Invoice = {
  id:     string
  date:   string
  plan:   string
  amount: string
  status: string
  url:    string | null
}

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

const PLAN_KEY_MAP = { BASIC: 'basico', STANDARD: 'estandar', PREMIUM: 'premium' } as const

export function PlanManager() {
  const [billing,     setBilling]     = useState<'monthly' | 'annual'>('monthly')
  const [redirecting, setRedirecting] = useState<string | null>(null)
  const { data: artist }           = useArtist()
  const { data: galleries = [] }   = useGalleries()
  const { data: artworks  = [] }   = useArtworks()

  const handleUpgrade = async (planKey: string) => {
    const planEnum = planKey === 'estandar' ? 'STANDARD' : 'PREMIUM'
    setRedirecting(planKey)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ plan: planEnum }),
      })
      const { url } = await res.json()
      if (url) window.location.href = url
    } finally {
      setRedirecting(null)
    }
  }

  const handlePortal = async () => {
    setRedirecting('portal')
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const { url } = await res.json()
      if (url) window.location.href = url
    } finally {
      setRedirecting(null)
    }
  }

  const { data: invoices = [] } = useQuery<Invoice[]>({
    queryKey: ['stripe-invoices'],
    queryFn:  async () => {
      const res = await fetch('/api/stripe/invoices')
      if (!res.ok) return []
      return res.json()
    },
  })

  const planEnum    = artist?.plan ?? 'BASIC'
  const planKey     = PLAN_KEY_MAP[planEnum]
  const limits      = PLAN_LIMITS[planEnum]
  const currentPlan = PLANS.find(p => p.key === planKey)!

  const usage = {
    galleries: { used: galleries.length,                                    max: limits.galleries           },
    artworks:  { used: artworks.filter(a => a.status === 'EXPOSED').length, max: limits.artworksPerGallery  },
  }

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
            { label: 'Galerías',       used: usage.galleries.used, max: usage.galleries.max },
            { label: 'Obras expuestas', used: usage.artworks.used,  max: usage.artworks.max  },
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 reveal rd2">
        {PLANS.map((plan) => {
          const isCurrent = plan.key === planKey
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
                {isCurrent ? (
                  <div className="flex flex-col gap-2">
                    <div className="text-center text-[12px] text-ink3 py-3 border border-(--border)">
                      Plan actual
                    </div>
                    {artist?.stripeCustomerId && (
                      <button
                        type="button"
                        onClick={handlePortal}
                        disabled={redirecting === 'portal'}
                        className="text-[11px] text-ink3 hover:text-ink transition-colors disabled:opacity-50"
                      >
                        {redirecting === 'portal' ? 'Abriendo…' : 'Gestionar suscripción →'}
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => plan.price > 0 ? handleUpgrade(plan.key) : handlePortal()}
                    disabled={redirecting === plan.key}
                    className={`w-full relative overflow-hidden text-[13px] py-3 font-medium rounded-xs transition-all ease-[cubic-bezier(.22,1,.36,1)] group hover:-translate-y-px disabled:opacity-60 ${
                      plan.key === 'estandar'
                        ? 'bg-gold text-bg hover:bg-gold-hi'
                        : 'bg-ink text-bg hover:bg-ink2'
                    }`}
                  >
                    {redirecting === plan.key
                      ? 'Redirigiendo…'
                      : plan.price === 0 ? 'Cambiar a Básico' : `Mejorar a ${plan.label}`}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Billing history */}
      <section className="reveal rd3">
        <h2 className="font-serif text-[22px] font-bold mb-5">Historial de facturación</h2>
        <div className="border border-(--border)">
          <div className="grid grid-cols-[1fr_auto_auto] md:grid-cols-[1fr_1fr_1fr_auto] text-[10px] tracking-[2px] uppercase text-ink3 px-5 py-3 border-b border-(--border) bg-bg2">
            <span>Período</span>
            <span className="hidden md:block">Plan</span>
            <span>Importe</span>
            <span>Estado</span>
          </div>
          {invoices.map((inv: Invoice) => (
            <div
              key={inv.id}
              className="grid grid-cols-[1fr_auto_auto] md:grid-cols-[1fr_1fr_1fr_auto] items-center px-5 py-4 text-[13px] border-b border-(--border) last:border-b-0"
            >
              <span className="text-ink">{inv.date}</span>
              <span className="hidden md:block text-ink3">{inv.plan}</span>
              <span className="text-ink3">{inv.amount}</span>
              {inv.url ? (
                <a
                  href={inv.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] px-2 py-0.5 bg-(--ok-dim) text-ok border border-[oklch(56%_0.14_155/0.2)] no-underline hover:underline"
                >
                  {inv.status}
                </a>
              ) : (
                <span className="text-[11px] px-2 py-0.5 bg-(--ok-dim) text-ok border border-[oklch(56%_0.14_155/0.2)]">
                  {inv.status}
                </span>
              )}
            </div>
          ))}
          {invoices.length === 0 && (
            <div className="px-5 py-12 flex flex-col items-center gap-3 text-center">
              <span className="font-serif text-[44px] leading-none text-ink3 opacity-15 select-none">◎</span>
              <span className="text-[14px] text-ink3">Sin facturas todavía</span>
              <span className="text-[12px] text-ink3 opacity-60">Las facturas aparecerán aquí tras tu primera suscripción.</span>
            </div>
          )}
        </div>
        <p className="text-[12px] text-ink3 mt-3">Las facturas se envían automáticamente al email de tu cuenta.</p>
      </section>
    </div>
  )
}
