import type { ReactNode } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen md:grid" style={{ gridTemplateColumns: '240px 1fr' }}>
      <div className="max-md:hidden">
        <Sidebar />
      </div>
      <div className="min-h-screen flex flex-col overflow-auto">
        {children}
      </div>
    </div>
  )
}
