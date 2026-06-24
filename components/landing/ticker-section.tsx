const ITEMS = [
  'Galerías inmersivas', 'Arte contemporáneo', 'Escultura digital',
  'Fotografía de autor', 'Instalaciones 3D', 'Videoarte', 'Pintura', 'Arte emergente',
]

export function TickerSection() {
  const doubled = [...ITEMS, ...ITEMS]

  return (
    <div className="overflow-hidden border-t border-b border-(--border) py-4 bg-bg2 mt-20">
      <div
        className="flex whitespace-nowrap"
        style={{ animation: 'ticker 30s linear infinite' }}
      >
        {doubled.map((item, i) => (
          <span key={`${item}-${i}`} className="text-[12px] tracking-[4px] uppercase text-ink3 px-9">
            {item}
            {i < doubled.length - 1 && (
              <span className="text-gold px-1">✦</span>
            )}
          </span>
        ))}
      </div>
    </div>
  )
}
