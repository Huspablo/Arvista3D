import { Topbar }       from '@/components/dashboard/topbar'
import { PlanManager }  from '@/components/dashboard/plan-manager'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

export default function PlanPage() {
  return (
    <>
      <Topbar title="Mi plan" />
      <div className="flex-1 px-12 py-8 max-md:px-6">
        <PlanManager />
      </div>
      <ScrollReveal />
    </>
  )
}
