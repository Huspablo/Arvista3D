import { NextResponse }           from 'next/server'
import { requireArtist, serviceErrorToResponse } from '@/lib/api-helpers'
import { stripe, PLAN_TO_PRICE }  from '@/lib/stripe'
import { db }                     from '@/lib/db'
import { z }                      from 'zod'
import type { Plan }              from '@prisma/client'

const Schema = z.object({
  plan: z.enum(['STANDARD', 'PREMIUM']),
})

export async function POST(req: Request) {
  const { artist, error } = await requireArtist()
  if (error) return error

  try {
    const body   = await req.json()
    const parsed = Schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const targetPlan = parsed.data.plan as Plan
    const priceId    = PLAN_TO_PRICE[targetPlan]
    if (!priceId) return NextResponse.json({ error: 'Plan no válido' }, { status: 400 })

    // Obtener o crear el customer de Stripe vinculado a este artista
    let customerId = artist.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: { artistId: artist.id, clerkId: artist.clerkId },
      })
      customerId = customer.id
      await db.artist.update({
        where: { id: artist.id },
        data:  { stripeCustomerId: customerId },
      })
    }

    const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      customer:             customerId,
      mode:                 'subscription',
      line_items:           [{ price: priceId, quantity: 1 }],
      success_url:          `${origin}/dashboard/plan?success=1`,
      cancel_url:           `${origin}/dashboard/plan`,
      allow_promotion_codes: true,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    return serviceErrorToResponse(err)
  }
}
