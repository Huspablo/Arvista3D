'use client'

import Link from 'next/link'
import { useGalleries } from '@/lib/hooks/use-galleries'

export function QuickActions() {
  const { data: galleries } = useGalleries()
  const firstGallery = galleries?.[0]

  return (
    <div>
      <div className="flex items-center justify-between mb-5 reveal">
        <span className="font-serif text-[22px] font-bold">Acciones rápidas</span>
      </div>
      <div className="grid grid-cols-3 gap-2 reveal rd1">
        <Link
          href="/dashboard/artworks/new"
          className="flex items-center gap-3 p-4 border border-(--border) bg-bg no-underline text-ink hover:border-(--border-md) hover:bg-bg2 hover:-translate-y-px transition-all ease-[cubic-bezier(.22,1,.36,1)]"
        >
          <div className="w-9 h-9 border border-(--border) flex items-center justify-center text-[16px] shrink-0">+</div>
          <div>
            <div className="text-[14px] font-normal leading-[1.3]">Nueva obra</div>
            <div className="text-[11px] text-ink3 mt-px">Subir & publicar</div>
          </div>
        </Link>

        {firstGallery ? (
          <Link
            href={`/galleries/${firstGallery.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 border border-(--border) bg-bg no-underline text-ink hover:border-(--border-md) hover:bg-bg2 hover:-translate-y-px transition-all ease-[cubic-bezier(.22,1,.36,1)]"
          >
            <div className="w-9 h-9 border border-(--border) flex items-center justify-center text-[16px] shrink-0">◻</div>
            <div>
              <div className="text-[14px] font-normal leading-[1.3]">Ver galería</div>
              <div className="text-[11px] text-ink3 mt-px">Vista pública</div>
            </div>
          </Link>
        ) : (
          <Link
            href="/dashboard/galleries/new"
            className="flex items-center gap-3 p-4 border border-(--border) bg-bg no-underline text-ink hover:border-(--border-md) hover:bg-bg2 hover:-translate-y-px transition-all ease-[cubic-bezier(.22,1,.36,1)]"
          >
            <div className="w-9 h-9 border border-(--border) flex items-center justify-center text-[16px] shrink-0">◻</div>
            <div>
              <div className="text-[14px] font-normal leading-[1.3]">Crear galería</div>
              <div className="text-[11px] text-ink3 mt-px">Primera exposición</div>
            </div>
          </Link>
        )}

        <Link
          href="/dashboard/plan"
          className="flex items-center gap-3 p-4 border border-(--border) bg-bg no-underline text-ink hover:border-(--border-md) hover:bg-bg2 hover:-translate-y-px transition-all ease-[cubic-bezier(.22,1,.36,1)]"
        >
          <div className="w-9 h-9 border border-(--border) flex items-center justify-center text-[16px] shrink-0">◎</div>
          <div>
            <div className="text-[14px] font-normal leading-[1.3]">Mejorar plan</div>
            <div className="text-[11px] text-ink3 mt-px">Más galerías</div>
          </div>
        </Link>
      </div>
    </div>
  )
}
