import { NextResponse } from 'next/server'
import { db }           from '@/lib/db'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params

  const artwork = await db.artwork.findFirst({
    where: {
      id,
      status: 'EXPOSED',
      slot:   { gallery: { visibility: 'PUBLIC' } },
    },
    include: {
      artist: { select: { id: true, name: true, bio: true, avatarUrl: true } },
      slot:   {
        select: {
          gallery: { select: { id: true, name: true, slug: true } },
        },
      },
    },
  })

  if (!artwork) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Incrementar vistas sin bloquear la respuesta
  db.artwork.update({ where: { id }, data: { viewCount: { increment: 1 } } }).catch(() => null)

  return NextResponse.json(artwork)
}
