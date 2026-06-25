import Image from 'next/image'

interface Props {
  images:    string[]
  emptyBg?:  string
}

export function GalleryPreviewMosaic({ images, emptyBg = 'bg-bg2' }: Props) {
  if (images.length === 0) {
    return (
      <div className={`w-full h-full ${emptyBg} flex items-center justify-center`}>
        <span className="font-serif text-[48px] opacity-10">◇</span>
      </div>
    )
  }

  const displayed = images.slice(0, 3)
  const cols = displayed.length >= 3 ? 'grid-cols-3' : displayed.length === 2 ? 'grid-cols-2' : ''

  return (
    <div className={`w-full h-full grid gap-px ${cols}`}>
      {displayed.map((src, idx) => (
        <div key={idx} className="relative overflow-hidden">
          <Image
            src={src}
            alt=""
            fill
            sizes="(max-width: 768px) 50vw, 260px"
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04]"
          />
        </div>
      ))}
    </div>
  )
}
