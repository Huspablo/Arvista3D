import Image from 'next/image'
import { MOCK_ARTISTS } from '@/lib/mock-data/landing'

export function ArtistsSection() {
  return (
    <section id="artistas" className="py-30 px-15 max-w-370 mx-auto max-md:py-20 max-md:px-6">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-(--border) pb-7 mb-12 reveal max-md:flex-col max-md:items-start max-md:gap-4">
        <div>
          <span className="text-[11px] tracking-[6px] uppercase text-gold mb-5 block">Comunidad</span>
          <h2
            className="font-serif font-black leading-[.95]"
            style={{ fontSize: 'clamp(36px, 5vw, 68px)' }}
          >
            Artistas <em className="italic text-gold">destacados</em>
          </h2>
        </div>
        <a href="#" className="text-ink2 text-[13px] tracking-[2px] no-underline uppercase border-b border-(--border-md) pb-0.5 hover:border-ink hover:text-ink transition-all whitespace-nowrap">
          Ver todos →
        </a>
      </div>

      {/* Cards grid */}
      <div
        className="grid grid-cols-4 gap-px bg-(--border) border border-(--border) max-md:grid-cols-2 max-sm:grid-cols-1"
      >
        {MOCK_ARTISTS.map((a, i) => (
          <div
            key={a.name}
            className={`bg-bg px-7 py-8 hover:bg-bg2 transition-colors reveal ${i > 0 ? `rd${i}` : ''}`}
          >
            <div className="relative w-14 h-14 rounded-full mb-5 border border-(--border) overflow-hidden">
              <Image src={a.src} alt={a.name} fill sizes="56px" className="object-cover" />
            </div>
            <div className="font-serif text-[20px] font-bold mb-1.25">{a.name}</div>
            <div className="text-[12px] text-ink3 tracking-[2px] uppercase mb-4">{a.specialty}</div>
            <div className="text-[13px] text-ink3">
              <strong className="text-gold text-[15px]">{a.galleries}</strong> galerías ·{' '}
              <strong className="text-gold text-[15px]">{a.artworks}</strong> obras
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
