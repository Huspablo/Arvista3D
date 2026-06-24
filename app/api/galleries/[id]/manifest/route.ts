import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { buildManifest } from '@/lib/services/manifest.service'
import { serviceErrorToResponse } from '@/lib/api-helpers'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params

    // Verificar que la galería existe y determinar su visibilidad
    const gallery = await db.gallery.findUnique({
      where:  { id },
      select: { visibility: true, artistId: true },
    })
    if (!gallery) return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })

    // Las galerías privadas solo las puede ver su artista propietario
    if (gallery.visibility === 'PRIVATE') {
      const { userId } = await auth()
      if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

      const artist = await db.artist.findUnique({ where: { clerkId: userId }, select: { id: true } })
      if (!artist || artist.id !== gallery.artistId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const manifest = await buildManifest(id)
    return NextResponse.json(manifest)
  } catch (err) {
    return serviceErrorToResponse(err)
  }
}
