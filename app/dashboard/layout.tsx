import type { ReactNode } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { MobileDashboardNav } from '@/components/dashboard/mobile-dashboard-nav'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="md:h-screen md:overflow-hidden md:grid md:grid-cols-[240px_1fr]">
      <div className="max-md:hidden md:h-full">
        <Sidebar />
      </div>
      <div className="flex flex-col overflow-y-auto pb-16 md:pb-0 md:h-full">
        {children}
      </div>
      <MobileDashboardNav />
    </div>
  )
}
