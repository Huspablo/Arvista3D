'use client'

import { useState, useEffect } from 'react'

interface Props {
  arts:  string[]
  title: string
}

function ArtSlide({ src, title }: { src: string; title: string }) {
  const hasImage = src.startsWith('http') || src.startsWith('/')

  return (
    <div
      className={`w-full h-full absolute inset-0 transition-transform duration-800 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.03]`}
      aria-label={title}
      style={hasImage ? { backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
    >
      {!hasImage && (
        <div className="w-full h-full flex items-center justify-center">
          <span className="font-serif text-[48px] opacity-20" style={{ color: 'oklch(90% 0.004 75)' }}>◇</span>
        </div>
      )}
    </div>
  )
}

export function ArtworkImageZone({ arts, title }: Props) {
  const [activeIdx,    setActiveIdx]   = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const slides    = arts.length > 0 ? arts : ['']
  const activeSrc = slides[activeIdx]
  const hasImage  = activeSrc.startsWith('http') || activeSrc.startsWith('/')

  // Cerrar lightbox con Escape
  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightboxOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [lightboxOpen])

  return (
    <>
      {/* Zona de imagen — fondo oscuro: la obra aparece como en un spotlight de museo */}
      <div
        className="relative flex flex-col border-r border-white/8 max-md:border-r-0 md:h-full"
        style={{ background: 'oklch(11% 0.008 75)' }}
      >
        {/* Imagen principal */}
        <div className="flex-1 relative overflow-hidden min-h-75 group">
          <ArtSlide src={activeSrc} title={title} />
          {hasImage && (
            <button
              onClick={() => setLightboxOpen(true)}
              className="absolute bottom-5 right-5 px-3.5 py-2 text-[11px] tracking-[2px] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 border"
              style={{
                background:  'oklch(11% 0.008 75 / .7)',
                backdropFilter: 'blur(8px)',
                borderColor: 'oklch(100% 0 0 / .15)',
                color:       'oklch(80% 0.006 75)',
              }}
            >
              Ver ampliado ⊞
            </button>
          )}
        </div>

        {/* Tira de miniaturas */}
        {slides.length > 1 && (
          <div
            className="flex gap-2 px-5 py-4 border-t"
            style={{ borderColor: 'oklch(100% 0 0 / .08)', background: 'oklch(9% 0.006 75)' }}
          >
            {slides.map((src, i) => {
              const hasImg = src.startsWith('http') || src.startsWith('/')
              return (
                <button
                  key={src || i}
                  onClick={() => setActiveIdx(i)}
                  className={`w-18 h-13.5 shrink-0 overflow-hidden border-2 transition-all ${
                    i === activeIdx ? 'border-gold' : 'border-transparent hover:scale-[1.04]'
                  }`}
                >
                  {hasImg ? (
                    <img src={src} alt="" className="w-full h-full object-cover" /> // eslint-disable-line
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: 'oklch(18% 0.008 75)' }}>
                      <span className="text-[16px] opacity-20" style={{ color: 'oklch(80% 0.006 75)' }}>◇</span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-1000 flex items-center justify-center bg-ink/90 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-5 right-6 text-bg/60 hover:text-bg text-[28px] leading-none transition-colors"
            aria-label="Cerrar"
          >
            ✕
          </button>
          {slides.length > 1 && activeIdx > 0 && (
            <button
              onClick={e => { e.stopPropagation(); setActiveIdx(i => i - 1) }}
              className="absolute left-6 text-bg/60 hover:text-bg text-[32px] leading-none transition-colors"
            >
              ‹
            </button>
          )}
          {slides.length > 1 && activeIdx < slides.length - 1 && (
            <button
              onClick={e => { e.stopPropagation(); setActiveIdx(i => i + 1) }}
              className="absolute right-6 text-bg/60 hover:text-bg text-[32px] leading-none transition-colors"
            >
              ›
            </button>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeSrc}
            alt={title}
            onClick={e => e.stopPropagation()}
            className="max-w-[90vw] max-h-[90vh] object-contain shadow-2xl"
          />
        </div>
      )}
    </>
  )
}
