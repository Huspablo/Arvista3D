import Image from 'next/image'

interface Props {
  images:       string[]
  wallColor?:   string | null
  gradientH?:   string
}

export function GalleryPreview({ images, wallColor, gradientH = 'h-10' }: Props) {
  if (images.length === 0) {
    return (
      <>
        <div
          className="absolute inset-0"
          style={{ background: wallColor ?? 'var(--color-bg2)' }}
        />
        <svg
          viewBox="0 0 200 130"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 w-full h-full text-ink"
          aria-hidden="true"
        >
          <line x1="0" y1="108" x2="200" y2="108" stroke="currentColor" strokeOpacity="0.08" strokeWidth="0.75"/>
          <rect x="22" y="22" width="48" height="62" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1"/>
          <rect x="27" y="27" width="38" height="52" fill="currentColor" fillOpacity="0.03" stroke="currentColor" strokeOpacity="0.07" strokeWidth="0.5"/>
          <rect x="86" y="32" width="46" height="34" stroke="currentColor" strokeOpacity="0.13" strokeWidth="1"/>
          <rect x="91" y="37" width="36" height="24" fill="currentColor" fillOpacity="0.03" stroke="currentColor" strokeOpacity="0.05" strokeWidth="0.5"/>
          <rect x="148" y="38" width="32" height="42" stroke="currentColor" strokeOpacity="0.10" strokeWidth="1"/>
        </svg>
        <span className="relative text-[10px] tracking-[2.5px] uppercase text-ink3 opacity-45 z-1">
          Sin obras expuestas
        </span>
      </>
    )
  }

  if (images.length === 1) {
    return (
      <>
        <Image src={images[0]} alt="" fill sizes="(max-width: 768px) 100vw, 400px" className="object-cover" />
        <div className={`absolute inset-x-0 bottom-0 ${gradientH} bg-linear-to-t from-ink/20 to-transparent`} />
      </>
    )
  }

  return (
    <div
      className="absolute inset-0 grid gap-px bg-bg3"
      style={{ gridTemplateColumns: '3fr 2fr' }}
    >
      <div className="relative overflow-hidden">
        <Image src={images[0]} alt="" fill sizes="240px" className="object-cover" />
      </div>
      <div className="flex flex-col gap-px">
        <div className="relative overflow-hidden flex-1 min-h-0">
          <Image src={images[1]} alt="" fill sizes="160px" className="object-cover" />
        </div>
        {images[2] && (
          <div className="relative overflow-hidden flex-1 min-h-0">
            <Image src={images[2]} alt="" fill sizes="160px" className="object-cover" />
          </div>
        )}
      </div>
    </div>
  )
}
