// Source of truth for plan limits and pricing data.
// No server-only dependencies — safe to import from both client and server code.

export const PLAN_LIMITS = {
  BASIC:    { galleries: 1, artworksPerGallery: 10 },
  STANDARD: { galleries: 2, artworksPerGallery: 20 },
  PREMIUM:  { galleries: 3, artworksPerGallery: 50 },
} as const

export type PlanKey    = 'basico' | 'estandar' | 'premium'
export type PlanEnum   = 'BASIC' | 'STANDARD' | 'PREMIUM'

export interface PlanData {
  key:      PlanKey
  planEnum: PlanEnum
  label:    string
  price:    number
  period:   string
  features: string[]
}

export const PLANS: PlanData[] = [
  {
    key:      'basico',
    planEnum: 'BASIC',
    label:    'Básico',
    price:    0,
    period:   'gratis',
    features: [
      `${PLAN_LIMITS.BASIC.galleries} galería pública`,
      `Hasta ${PLAN_LIMITS.BASIC.artworksPerGallery} obras por galería`,
      'Viewer 3D incluido',
      'Dominio arvista.art/galleries/…',
    ],
  },
  {
    key:      'estandar',
    planEnum: 'STANDARD',
    label:    'Estándar',
    price:    12,
    period:   '/ mes',
    features: [
      `${PLAN_LIMITS.STANDARD.galleries} galerías públicas`,
      `Hasta ${PLAN_LIMITS.STANDARD.artworksPerGallery} obras por galería`,
      'Viewer 3D incluido',
      'Analítica de visitas',
      'Eliminar marca de agua',
    ],
  },
  {
    key:      'premium',
    planEnum: 'PREMIUM',
    label:    'Premium',
    price:    29,
    period:   '/ mes',
    features: [
      `${PLAN_LIMITS.PREMIUM.galleries} galerías públicas`,
      `Hasta ${PLAN_LIMITS.PREMIUM.artworksPerGallery} obras por galería`,
      'Viewer 3D incluido',
      'Analítica avanzada',
      'Soporte prioritario',
      'Dominio personalizado (próx.)',
    ],
  },
]

export const PLAN_KEY_MAP: Record<PlanEnum, PlanKey> = {
  BASIC:    'basico',
  STANDARD: 'estandar',
  PREMIUM:  'premium',
}
