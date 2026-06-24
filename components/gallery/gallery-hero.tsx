import Link from 'next/link'
import { ShareButton } from './share-button'

const TEMPLATE_LABEL: Record<string, string> = {
  'white-cube-8': 'White Cube',
  'long-hall':    'Long Hall',
  'open-room':    'Open Room',
}

const FLOOR_LABEL: Record<string, string> = {
  'CONCRETE': 'Hormigón',
  'PARQUET':  'Parquet',
  'MARBLE':   'Mármol',
}

interface Props {
  name:           string
  artist:         string
  count:          number
  slug:           string
  isPreview?:     boolean
  isPublic?:      boolean
  description?:   string
  wallColor?:     string | null
  floorMaterial?: string
  templateKey?:   string
}

export function GalleryHero({
  name, artist, count, slug,
  isPreview     = false,
  isPublic      = true,
  description,
  wallColor,
  floorMaterial,
  templateKey,
}: Props) {
  const templateLabel = templateKey    ? (TEMPLATE_LABEL[templateKey]    ?? templateKey)    : null
  const floorLabel    = floorMaterial  ? (FLOOR_LABEL[floorMaterial]     ?? floorMaterial)  : null
  const hasMetadata   = templateLabel || floorLabel || wallColor

  return (
    <section className="border-b border-(--border) pt-18 px-15 max-md:px-6 max-md:pt-10">
      <div
        className="max-w-370 mx-auto grid items-start gap-10 pb-10 max-md:grid-cols-1"
        style={{ gridTemplateColumns: '1fr auto' }}
      >
        {/* ── Left: título, descripción, metadatos ── */}
        <div>
          <span className="text-[11px] tracking-[5px] uppercase text-gold mb-3.5 block reveal">
            {isPreview ? 'Vista previa — Galería privada' : 'Galería pública'}
          </span>

          <h1
            className="font-serif font-black leading-[.92] mb-5 reveal rd1"
            style={{ fontSize: 'clamp(40px, 6vw, 88px)' }}
          >
            {name}
          </h1>

          {description && (
            <p className="font-serif italic text-[17px] leading-[1.8] text-ink2 mb-6 max-w-120 reveal rd2">
              {description}
            </p>
          )}

          <div className="flex items-center gap-5 text-[14px] text-ink3 reveal rd2">
            <div
              className="w-8 h-8 rounded-full shrink-0 border-2 border-(--border-md)"
              style={{ background: 'radial-gradient(ellipse at 25% 75%, oklch(68% .10 300), oklch(84% .14 82))' }}
            />
            <span>
              Por{' '}
              <Link
                href="#artist"
                className="text-ink no-underline border-b border-(--border-md) hover:border-gold transition-colors"
              >
                {artist}
              </Link>
            </span>
            <span className="w-px h-3.5 bg-(--border-md)" />
            <span>{count} obra{count !== 1 ? 's' : ''}</span>
          </div>

          {hasMetadata && (
            <div className="flex items-center gap-4 mt-5 pt-5 border-t border-(--border) flex-wrap reveal rd3">
              {templateLabel && (
                <div className="flex items-center gap-1.5 text-[12px] text-ink3">
                  <span className="opacity-40">◻</span>
                  <span>{templateLabel}</span>
                </div>
              )}
              {floorLabel && (
                <>
                  {templateLabel && <span className="w-px h-3 bg-(--border-md)" />}
                  <span className="text-[12px] text-ink3">Suelo · {floorLabel}</span>
                </>
              )}
              {wallColor && (
                <>
                  <span className="w-px h-3 bg-(--border-md)" />
                  <div className="flex items-center gap-2 text-[12px] text-ink3">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-(--border-md) shrink-0"
                      style={{ background: wallColor }}
                    />
                    <span>Pared</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Right: acciones ── */}
        <div className="flex flex-col items-end gap-3 reveal rd2 max-md:flex-row max-md:items-center max-md:w-full max-md:mt-2 max-md:flex-wrap">
          <Link
            href={`/galleries/${slug}/viewer`}
            className="relative overflow-hidden text-[14px] px-7 py-3 rounded-xs bg-ink text-bg no-underline font-medium hover:-translate-y-px transition-all ease-[cubic-bezier(.22,1,.36,1)] group max-md:flex-1 max-md:text-center"
          >
            <span className="absolute inset-0 bg-gold -translate-x-full group-hover:translate-x-0 transition-transform duration-400 ease-[cubic-bezier(.22,1,.36,1)]" />
            <span className="relative z-1">◈ Ver en 3D</span>
          </Link>
          <Link
            href="#artist"
            className="text-[14px] px-7 py-3 border-[1.5px] border-(--border-md) rounded-xs text-ink no-underline hover:border-ink hover:-translate-y-px transition-all max-md:flex-1 max-md:text-center"
          >
            Contactar →
          </Link>
          <ShareButton isPublic={isPublic} />
        </div>
      </div>
    </section>
  )
}
