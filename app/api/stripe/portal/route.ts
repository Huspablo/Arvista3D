import { NextResponse }           from 'next/server'
import { requireArtist, serviceErrorToResponse } from '@/lib/api-helpers'
import { stripe }                 from '@/lib/stripe'

export async function POST(req: Request) {
  const { artist, error } = await requireArtist()
  if (error) return error

  try {
    if (!artist.stripeCustomerId) {
      return NextResponse.json({ error: 'Sin suscripción activa' }, { status: 400 })
    }

    const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const session = await stripe.billingPortal.sessions.create({
      customer:   artist.stripeCustomerId,
      return_url: `${origin}/dashboard/plan`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    return serviceErrorToResponse(err)
  }
}
