import Link                  from 'next/link'
import { notFound }          from 'next/navigation'
import { auth }              from '@clerk/nextjs/server'
import { ViewerClient }      from '@/components/viewer/viewer-client'
import { ViewerMobileHint }  from '@/components/viewer/viewer-mobile-hint'
import { db }                from '@/lib/db'
import { buildManifest }     from '@/lib/services/manifest.service'

export default async function ViewerPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const gallery = await db.gallery.findUnique({
    where:   { slug },
    include: { artist: { select: { clerkId: true } } },
  })
  if (!gallery) notFound()

  // El propietario puede entrar al viewer aunque la galería sea privada
  const { userId } = await auth()
  const isOwner    = userId === gallery.artist.clerkId

  if (gallery.visibility === 'PRIVATE' && !isOwner) notFound()

  const isPreview = isOwner && gallery.visibility === 'PRIVATE'

  const manifest = await buildManifest(gallery.id)

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: '#f0ece6' }}>

      {/* HUD */}
      <div
        className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-4 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, oklch(8% 0 0 / .65), transparent)' }}
      >
        <div className="pointer-events-auto flex items-center gap-4">
          <Link
            href={`/galleries/${slug}`}
            className="text-[13px] no-underline transition-opacity hover:opacity-100"
            style={{ color: 'oklch(78% 0.008 75 / .7)' }}
          >
            ← Volver
          </Link>
          <span className="w-px h-4" style={{ background: 'oklch(78% 0.008 75 / .2)' }} />
          <span className="font-serif text-[15px] font-bold" style={{ color: 'oklch(90% 0.008 75)' }}>
            {manifest.gallery.name}
          </span>
        </div>
        {isPreview ? (
          <span
            className="text-[9px] tracking-[2.5px] uppercase max-md:hidden"
            style={{ color: 'oklch(65% 0.130 82 / .75)' }}
          >
            ◈ Vista privada
          </span>
        ) : (
          <span
            className="text-[11px] tracking-[3px] uppercase max-md:hidden"
            style={{ color: 'oklch(55% 0.008 75 / .55)' }}
          >
            Arrastra · Rueda para zoom · Clic en una obra
          </span>
        )}
      </div>

      <ViewerMobileHint />

      <div className="flex-1">
        <ViewerClient
          manifest={manifest}
          galleryId={gallery.id}
          isOwner={isOwner}
        />
      </div>
    </div>
  )
}
