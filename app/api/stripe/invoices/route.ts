import { NextResponse }               from 'next/server'
import { requireArtist, serviceErrorToResponse } from '@/lib/api-helpers'
import { stripe, PRICE_TO_PLAN }     from '@/lib/stripe'

const PLAN_LABEL: Record<string, string> = {
  STANDARD: 'Estándar',
  PREMIUM:  'Premium',
  BASIC:    'Básico',
}

export async function GET() {
  const { artist, error } = await requireArtist()
  if (error) return error

  if (!artist.stripeCustomerId) {
    return NextResponse.json([])
  }

  try {
    const list = await stripe.invoices.list({
      customer: artist.stripeCustomerId,
      limit:    12,
    })

    return NextResponse.json(
      list.data.map(inv => {
        const priceId  = inv.lines.data[0]?.price?.id ?? ''
        const planEnum = PRICE_TO_PLAN[priceId] ?? 'BASIC'
        return {
          id:     inv.id,
          date:   new Date(inv.created * 1000).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
          plan:   PLAN_LABEL[planEnum] ?? 'Básico',
          amount: inv.amount_paid > 0 ? `${(inv.amount_paid / 100).toFixed(2)}€` : '—',
          status: inv.status === 'paid' ? 'Pagada' : 'Pendiente',
          url:    inv.hosted_invoice_url ?? null,
        }
      })
    )
  } catch (err) {
    return serviceErrorToResponse(err)
  }
}
