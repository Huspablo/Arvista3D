import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getOrCreateArtist } from '@/lib/services/artist.service'
import * as Sentry from '@sentry/nextjs'
import type { Artist } from '@prisma/client'

// Obtiene el artista autenticado (crea el registro si es el primer login).
// Devuelve { artist } o una NextResponse 401 lista para retornar.
export async function requireArtist(): Promise<
  { artist: Artist; error: null } | { artist: null; error: NextResponse }
> {
  const { userId } = await auth()
  if (!userId) {
    return { artist: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  const artist = await getOrCreateArtist(userId)
  return { artist, error: null }
}

// Convierte errores de servicio conocidos en respuestas HTTP apropiadas
export function serviceErrorToResponse(err: unknown): NextResponse {
  const msg = err instanceof Error ? err.message : 'Internal server error'
  if (msg.startsWith('FORBIDDEN'))         return NextResponse.json({ error: msg }, { status: 403 })
  if (msg.startsWith('GALLERY_LIMIT'))     return NextResponse.json({ error: msg }, { status: 403 })
  if (msg.startsWith('CAPACITY_REACHED'))  return NextResponse.json({ error: msg }, { status: 403 })
  if (msg.startsWith('NO_SLOT'))           return NextResponse.json({ error: msg }, { status: 409 })
  if (msg.startsWith('INVALID_STATE'))     return NextResponse.json({ error: msg }, { status: 409 })
  if (msg.startsWith('GALLERY_NOT_FOUND')) return NextResponse.json({ error: msg }, { status: 404 })
  // Error inesperado — capturar en Sentry y registrar en consola
  Sentry.captureException(err)
  console.error('[API Error]', err)
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}
