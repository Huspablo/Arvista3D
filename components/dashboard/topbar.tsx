'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { useArtist } from '@/lib/hooks/use-artist'

interface TopbarProps {
  title: string
  actions?: ReactNode
}

export function Topbar({ title, actions }: TopbarProps) {
  const { data: artist } = useArtist()

  return (
    <div
      className="px-6 md:px-12 py-5 border-b border-(--border) flex items-center justify-between sticky top-0 z-50 bg-bg/95"
      style={{ backdropFilter: 'blur(16px)' }}
    >
      <span className="font-serif text-[22px] font-bold">{title}</span>

      <div className="flex items-center gap-3">
        {actions}

        <Link
          href="/dashboard/profile"
          title="Mi perfil"
          className="w-9 h-9 rounded-full border-2 border-(--border-md) shrink-0 overflow-hidden hover:border-gold transition-colors no-underline"
        >
          {artist?.avatarUrl
            ? /* eslint-disable-next-line @next/next/no-img-element */
              <img src={artist.avatarUrl} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full art-p1" />
          }
        </Link>
      </div>
    </div>
  )
}
