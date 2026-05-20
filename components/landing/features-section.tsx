const FEATURES = [
  {
    num: '01',
    title: 'Galerías inmersivas',
    body: 'Expón tu obra en espacios tridimensionales diseñados para cautivar. Cada galería es una experiencia que los visitantes pueden explorar como si estuvieran físicamente allí.',
  },
  {
    num: '02',
    title: 'Alcance global',
    body: 'Tu obra disponible para coleccionistas, curadores y amantes del arte en todo el mundo. Sin fronteras, sin horarios de apertura, sin intermediarios.',
  },
  {
    num: '03',
    title: 'Control total',
    body: 'Decide qué mostrar, cuándo y cómo. Panel de gestión diseñado para artistas — no para tecnólogos.',
  },
]

export function FeaturesSection() {
  return (
    <section className="bg-ink text-bg py-30 px-15 max-md:py-20 max-md:px-6">
      <div className="max-w-370 mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end border-b border-white/10 pb-10 mb-18 reveal max-md:flex-col max-md:items-start max-md:gap-3">
          <div>
            <span className="text-[11px] tracking-[5px] uppercase text-gold block mb-3">
              Por qué Arvista 3D
            </span>
            <h2
              className="font-serif font-bold leading-[1.1] text-[oklch(94%_0.008_75)]"
              style={{ fontSize: 'clamp(30px, 3.5vw, 48px)' }}
            >
              Lo que nos hace <em className="italic text-gold">diferentes.</em>
            </h2>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 max-md:grid-cols-1 max-md:gap-12">
          {FEATURES.map((f, i) => (
            <div
              key={f.num}
              className={`reveal ${i > 0 ? `rd${i}` : ''} border-r border-white/10 pr-12 mr-12 last:border-r-0 last:pr-0 last:mr-0 max-md:border-r-0 max-md:border-t max-md:border-white/10 max-md:pr-0 max-md:mr-0 max-md:pt-9 max-md:first:border-t-0 max-md:first:pt-0`}
            >
              <span
                className="font-serif font-black leading-none block mb-6"
                style={{
                  fontSize: 48,
                  color: 'transparent',
                  WebkitTextStroke: '1px rgba(255,255,255,0.18)',
                }}
              >
                {f.num}
              </span>
              <h3 className="font-serif text-[24px] font-bold leading-[1.15] mb-4 text-[oklch(94%_0.008_75)]">
                {f.title}
              </h3>
              <p className="text-[15px] text-white/45 leading-[1.85]">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
