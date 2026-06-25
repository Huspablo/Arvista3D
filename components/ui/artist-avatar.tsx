import Image from 'next/image'

interface Props {
  url:  string | null | undefined
  name: string
  size: number
}

export function ArtistAvatar({ url, name, size }: Props) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'

  if (url) {
    return (
      <Image
        src={url}
        alt={name}
        width={size}
        height={size}
        className="w-full h-full object-cover"
      />
    )
  }

  return (
    <div
      className="w-full h-full flex items-center justify-center font-serif font-bold"
      style={{
        background: 'radial-gradient(ellipse at 25% 75%, oklch(68% .10 300), oklch(84% .14 82))',
        color:      'oklch(94% 0.008 75)',
        fontSize:   `${Math.round(size * 0.36)}px`,
      }}
    >
      {initials}
    </div>
  )
}
