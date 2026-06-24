import { auth }             from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import Link                  from 'next/link'
import { db }                from '@/lib/db'
import { Topbar }            from '@/components/dashboard/topbar'
import { EditArtworkForm }   from '@/components/dashboard/edit-artwork-form'

type Props = { params: Promise<{ id: string }> }

export default async function EditArtworkPage({ params }: Props) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { id } = await params

  const artist = await db.artist.findUnique({ where: { clerkId: userId } })
  if (!artist) redirect('/dashboard')

  const artwork = await db.artwork.findFirst({ where: { id, artistId: artist.id } })
  if (!artwork) notFound()

  return (
    <>
      <Topbar
        title="Editar obra"
        actions={
          <Link
            href="/dashboard/artworks"
            className="text-[13px] px-5 py-2.25 border-[1.5px] border-(--border-md) rounded-xs text-ink bg-transparent no-underline hover:border-ink hover:bg-bg2 transition-all"
          >
            ← Volver
          </Link>
        }
      />
      <div className="flex-1">
        <EditArtworkForm artwork={artwork} />
      </div>
    </>
  )
}
