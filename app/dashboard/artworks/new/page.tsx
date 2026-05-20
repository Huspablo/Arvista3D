import Link         from 'next/link'
import { Topbar }   from '@/components/dashboard/topbar'
import { NewArtworkForm } from '@/components/dashboard/new-artwork-form'

export default function NewArtworkPage() {
  return (
    <>
      <Topbar
        title="Nueva obra"
        actions={
          <Link
            href="/dashboard/artworks"
            className="text-[13px] px-5 py-2.25 border-[1.5px] border-(--border-md) rounded-xs text-ink bg-transparent no-underline hover:border-ink hover:bg-bg2 transition-all"
          >
            ← Cancelar
          </Link>
        }
      />
      <div className="flex-1">
        <NewArtworkForm />
      </div>
    </>
  )
}
