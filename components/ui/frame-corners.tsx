interface FrameCornersProps {
  size?: number
  opacity?: number
}

export function FrameCorners({ size = 32, opacity = 0.65 }: FrameCornersProps) {
  // Reuse a single corner shape, mirrored via CSS transform for the other three
  const corner = (
    <>
      <path
        d={`M0.75,${size} L0.75,0.75 L${size},0.75`}
        stroke="oklch(65% 0.130 82)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="square"
      />
      <path
        d={`M5,${size} L5,5 L${size},5`}
        stroke="oklch(65% 0.130 82)"
        strokeWidth="0.75"
        fill="none"
        strokeLinecap="square"
        opacity="0.45"
      />
      <rect
        x="0" y="0" width="3" height="3"
        fill="oklch(65% 0.130 82)"
        opacity="0.8"
      />
    </>
  )

  return (
    <div
      className="absolute inset-0 pointer-events-none z-10"
      style={{ opacity }}
    >
      <svg className="absolute top-0 left-0" width={size} height={size}>{corner}</svg>
      <svg className="absolute top-0 right-0" width={size} height={size} style={{ transform: 'scaleX(-1)' }}>{corner}</svg>
      <svg className="absolute bottom-0 left-0" width={size} height={size} style={{ transform: 'scaleY(-1)' }}>{corner}</svg>
      <svg className="absolute bottom-0 right-0" width={size} height={size} style={{ transform: 'scale(-1)' }}>{corner}</svg>
    </div>
  )
}
