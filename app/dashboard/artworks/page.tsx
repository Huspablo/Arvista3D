import Link from 'next/link'
import { Topbar }      from '@/components/dashboard/topbar'
import { ArtworksList } from '@/components/dashboard/artworks-list'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

export default function ArtworksPage() {
  return (
    <>
      <Topbar
        title="Obras"
        actions={
          <Link
            href="/dashboard/artworks/new"
            className="relative overflow-hidden text-[13px] px-5 py-2.25 rounded-xs text-bg bg-ink no-underline font-medium hover:-translate-y-px transition-all ease-[cubic-bezier(.22,1,.36,1)] group"
          >
            <span className="absolute inset-0 bg-gold -translate-x-full group-hover:translate-x-0 transition-transform duration-400 ease-[cubic-bezier(.22,1,.36,1)]" />
            <span className="relative z-1">+ Nueva obra</span>
          </Link>
        }
      />
      <div className="flex-1">
        <ArtworksList />
      </div>
      <ScrollReveal />
    </>
  )
}
