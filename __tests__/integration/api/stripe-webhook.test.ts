import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/webhooks/stripe/route'

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockConstructEvent = vi.hoisted(() => vi.fn())
const mockUpdateMany     = vi.hoisted(() => vi.fn())

vi.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: { constructEvent: mockConstructEvent },
  },
  PRICE_TO_PLAN: {
    'price_standard': 'STANDARD',
    'price_premium':  'PREMIUM',
  },
}))

vi.mock('@/lib/db', () => ({
  db: { artist: { updateMany: mockUpdateMany } },
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRequest(body: string, signature = 'valid-sig') {
  return new Request('http://localhost/api/webhooks/stripe', {
    method:  'POST',
    headers: { 'stripe-signature': signature, 'content-type': 'text/plain' },
    body,
  })
}

function makeSubscriptionEvent(
  type: string,
  overrides: { status?: string; priceId?: string; id?: string; customer?: string } = {},
) {
  const subscription = {
    id:       overrides.id       ?? 'sub-1',
    customer: overrides.customer ?? 'cus-1',
    status:   overrides.status   ?? 'active',
    items:    { data: [{ price: { id: overrides.priceId ?? 'price_standard' } }] },
  }
  return { type, data: { object: subscription } }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('POST /api/webhooks/stripe', () => {
  beforeEach(() => vi.clearAllMocks())

  it('devuelve 400 si no hay header stripe-signature', async () => {
    const req = new Request('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      body:   'payload',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('devuelve 400 si la firma es inválida', async () => {
    mockConstructEvent.mockImplementation(() => { throw new Error('invalid') })
    const res = await POST(makeRequest('payload'))
    expect(res.status).toBe(400)
  })

  it('devuelve 200 y no actualiza BD para eventos no relevantes', async () => {
    mockConstructEvent.mockReturnValue({ type: 'invoice.payment_succeeded', data: { object: {} } })

    const res = await POST(makeRequest('payload'))
    expect(res.status).toBe(200)
    expect(mockUpdateMany).not.toHaveBeenCalled()
  })

  it('actualiza el plan a STANDARD cuando la suscripción está activa', async () => {
    mockConstructEvent.mockReturnValue(
      makeSubscriptionEvent('customer.subscription.updated', { priceId: 'price_standard' }),
    )
    mockUpdateMany.mockResolvedValue({ count: 1 })

    const res = await POST(makeRequest('payload'))
    expect(res.status).toBe(200)
    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { stripeCustomerId: 'cus-1' },
      data:  { plan: 'STANDARD', stripeSubscriptionId: 'sub-1' },
    })
  })

  it('actualiza el plan a PREMIUM con el price correcto', async () => {
    mockConstructEvent.mockReturnValue(
      makeSubscriptionEvent('customer.subscription.created', { priceId: 'price_premium' }),
    )
    mockUpdateMany.mockResolvedValue({ count: 1 })

    await POST(makeRequest('payload'))
    expect(mockUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ plan: 'PREMIUM' }) }),
    )
  })

  it('revierte a BASIC y borra stripeSubscriptionId cuando la suscripción se cancela', async () => {
    mockConstructEvent.mockReturnValue(
      makeSubscriptionEvent('customer.subscription.deleted', { status: 'canceled' }),
    )
    mockUpdateMany.mockResolvedValue({ count: 1 })

    await POST(makeRequest('payload'))
    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { stripeCustomerId: 'cus-1' },
      data:  { plan: 'BASIC', stripeSubscriptionId: null },
    })
  })

  it('revierte a BASIC cuando el estado no es active ni trialing', async () => {
    mockConstructEvent.mockReturnValue(
      makeSubscriptionEvent('customer.subscription.updated', { status: 'past_due', priceId: 'price_standard' }),
    )
    mockUpdateMany.mockResolvedValue({ count: 1 })

    await POST(makeRequest('payload'))
    expect(mockUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ plan: 'BASIC' }) }),
    )
  })
})
