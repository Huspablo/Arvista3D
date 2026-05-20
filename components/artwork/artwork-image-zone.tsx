'use client'

import { useState } from 'react'

interface Props {
  arts:  string[]
  title: string
}

export function ArtworkImageZone({ arts, title }: Props) {
  const [activeIdx, setActiveIdx] = useState(0)

  return (
    <div className="relative bg-bg2 border-r border-(--border) flex flex-col max-md:border-r-0">
      {/* Main image */}
      <div className="flex-1 relative overflow-hidden min-h-125 group">
        <div
          className={`w-full h-full absolute inset-0 ${arts[activeIdx]} transition-transform duration-800 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.03]`}
          aria-label={title}
        />
        <div className="absolute bottom-5 right-5 bg-bg border border-(--border) px-3.5 py-2 text-[11px] text-ink3 tracking-[2px] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Ver ampliado ⊞
        </div>
      </div>

      {/* Thumbnail strip */}
      <div className="flex gap-2 px-5 py-4 border-t border-(--border) bg-bg">
        {arts.map((art, i) => (
          <button
            key={art}
            onClick={() => setActiveIdx(i)}
            className={`w-18 h-13.5 shrink-0 overflow-hidden border-2 transition-all ${
              i === activeIdx ? 'border-gold' : 'border-transparent hover:scale-[1.04]'
            }`}
          >
            <div className={`w-full h-full ${art}`} />
          </button>
        ))}
      </div>
    </div>
  )
}
