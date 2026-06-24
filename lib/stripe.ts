import Stripe from 'stripe'
import type { Plan } from '@prisma/client'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
})

// Mapa Price ID → Plan de BD
export const PRICE_TO_PLAN: Record<string, Plan> = {
  [process.env.STRIPE_PRICE_STANDARD!]: 'STANDARD',
  [process.env.STRIPE_PRICE_PREMIUM!]:  'PREMIUM',
}

// Mapa Plan → Price ID para el checkout
export const PLAN_TO_PRICE: Partial<Record<Plan, string>> = {
  STANDARD: process.env.STRIPE_PRICE_STANDARD!,
  PREMIUM:  process.env.STRIPE_PRICE_PREMIUM!,
}
