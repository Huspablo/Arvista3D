'use client'

import { useEffect, useState } from 'react'

export function Greeting() {
  const [timeLabel, setTimeLabel] = useState('')

  useEffect(() => {
    const h = new Date().getHours()
    setTimeLabel(h < 13 ? 'Buenos días' : h < 20 ? 'Buenas tardes' : 'Buenas noches')
  }, [])

  return (
    <div className="mb-10 reveal in">
      <div className="text-[12px] tracking-[3px] uppercase text-ink3 mb-2">{timeLabel}</div>
      <h1
        className="font-serif font-bold leading-[1.1]"
        style={{ fontSize: 'clamp(28px, 3vw, 42px)' }}
      >
        Bienvenida de nuevo,<br />
        <em className="italic text-gold">Mariana.</em>
      </h1>
    </div>
  )
}
