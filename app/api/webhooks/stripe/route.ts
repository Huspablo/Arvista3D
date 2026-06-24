import { NextResponse } from 'next/server'
import { stripe, PRICE_TO_PLAN } from '@/lib/stripe'
import { db } from '@/lib/db'

// Stripe requiere el body en bruto para verificar la firma
export const runtime = 'nodejs'

export async function POST(req: Request) {
  const body      = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) return NextResponse.json({ error: 'No signature' }, { status: 400 })

  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Todos los eventos relevantes llevan un objeto Subscription
  const isSubEvent = [
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
  ].includes(event.type)

  if (!isSubEvent) return NextResponse.json({ ok: true })

  const subscription = event.data.object as {
    id:       string
    customer: string
    status:   string
    items:    { data: { price: { id: string } }[] }
  }

  const customerId = subscription.customer

  const priceId  = subscription.items.data[0]?.price?.id
  const isActive = ['active', 'trialing'].includes(subscription.status)

  // Determinar el plan según el price o volver a BASIC si se cancela
  const plan = (isActive && priceId && PRICE_TO_PLAN[priceId]) ? PRICE_TO_PLAN[priceId] : 'BASIC'

  await db.artist.updateMany({
    where: { stripeCustomerId: customerId },
    data:  {
      plan:                    plan,
      stripeSubscriptionId:    isActive ? subscription.id : null,
    },
  })

  return NextResponse.json({ ok: true })
}
