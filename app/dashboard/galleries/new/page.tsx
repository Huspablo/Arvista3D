import Link               from 'next/link'
import { Topbar }          from '@/components/dashboard/topbar'
import { NewGalleryForm }  from '@/components/dashboard/new-gallery-form'

export default function NewGalleryPage() {
  return (
    <>
      <Topbar
        title="Nueva galería"
        actions={
          <Link
            href="/dashboard/galleries"
            className="text-[13px] px-5 py-2.25 border-[1.5px] border-(--border-md) rounded-xs text-ink bg-transparent no-underline hover:border-ink hover:bg-bg2 transition-all"
          >
            ← Cancelar
          </Link>
        }
      />
      <div className="flex-1">
        <NewGalleryForm />
      </div>
    </>
  )
}
