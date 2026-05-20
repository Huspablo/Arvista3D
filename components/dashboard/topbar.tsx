import type { ReactNode } from 'react'

interface TopbarProps {
  title: string
  actions?: ReactNode
}

export function Topbar({ title, actions }: TopbarProps) {
  return (
    <div
      className="px-12 py-5 border-b border-(--border) flex items-center justify-between sticky top-0 z-50 bg-bg/95"
      style={{ backdropFilter: 'blur(16px)' }}
    >
      <span className="font-serif text-[22px] font-bold">{title}</span>
      <div className="flex items-center gap-3">
        {actions}
        <div className="w-9 h-9 rounded-full border-2 border-(--border-md) art-p1 shrink-0" />
      </div>
    </div>
  )
}
