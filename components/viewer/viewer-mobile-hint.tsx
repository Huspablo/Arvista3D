'use client'

import { useState, useEffect } from 'react'

export function ViewerMobileHint() {
  const [visible, setVisible] = useState(true)
  const [fading,  setFading]  = useState(false)

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 3500)
    const hideTimer = setTimeout(() => setVisible(false), 4000)
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer) }
  }, [])

  if (!visible) return null

  return (
    <div
      className="md:hidden absolute bottom-20 inset-x-0 flex justify-center pointer-events-none z-20"
      style={{
        opacity:    fading ? 0 : 1,
        transition: 'opacity 0.5s ease',
      }}
    >
      <div
        className="flex items-center gap-3 px-4 py-2.5 text-[12px] tracking-[1.5px]"
        style={{
          background:     'oklch(8% 0 0 / .65)',
          backdropFilter: 'blur(8px)',
          color:          'oklch(78% 0.008 75 / .8)',
          border:         '1px solid oklch(78% 0.008 75 / .12)',
        }}
      >
        <span>Arrastra</span>
        <span style={{ color: 'oklch(60% 0.130 82 / .6)' }}>·</span>
        <span>Pellizca para zoom</span>
      </div>
    </div>
  )
}
