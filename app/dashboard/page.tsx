import Link from 'next/link'
import { Topbar }        from '@/components/dashboard/topbar'
import { Greeting }      from '@/components/dashboard/greeting'
import { StatsRow }      from '@/components/dashboard/stats-row'
import { GalleriesGrid } from '@/components/dashboard/galleries-grid'
import { ActivityFeed }  from '@/components/dashboard/activity-feed'
import { QuickActions }  from '@/components/dashboard/quick-actions'
import { ScrollReveal }  from '@/components/ui/scroll-reveal'

export default function DashboardPage() {
  return (
    <>
      <Topbar
        title="Dashboard"
        actions={
          <>
            <Link
              href="/dashboard/artworks"
              className="text-[13px] px-5 py-2.25 border-[1.5px] border-(--border-md) rounded-xs text-ink bg-transparent no-underline hover:border-ink hover:bg-bg2 transition-all"
            >
              Ver obras
            </Link>
            <Link
              href="/dashboard/artworks/new"
              className="relative overflow-hidden text-[13px] px-5 py-2.25 rounded-xs text-bg bg-ink no-underline font-medium hover:-translate-y-px transition-all ease-[cubic-bezier(.22,1,.36,1)] group"
            >
              <span className="absolute inset-0 bg-gold -translate-x-full group-hover:translate-x-0 transition-transform duration-400 ease-[cubic-bezier(.22,1,.36,1)]" />
              <span className="relative z-1">+ Crear obra</span>
            </Link>
          </>
        }
      />

      <div className="flex-1 px-12 py-10 max-md:px-6">
        <Greeting />
        <StatsRow />
        <GalleriesGrid />

        {/* Bottom two-col */}
        <div
          className="grid gap-6 mt-8 max-md:grid-cols-1"
          style={{ gridTemplateColumns: '1.5fr 1fr' }}
        >
          <ActivityFeed />
          <QuickActions />
        </div>
      </div>

      <ScrollReveal />
    </>
  )
}
