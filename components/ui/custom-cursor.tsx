'use client'

import { useEffect, useRef } from 'react'

export function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dot  = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    let cx = window.innerWidth  / 2
    let cy = window.innerHeight / 2
    let rx = cx, ry = cy
    let rafId: number

    const onMove = (e: MouseEvent) => {
      cx = e.clientX
      cy = e.clientY
      dot.style.transform = `translate(calc(${cx}px - 50%), calc(${cy}px - 50%))`
    }

    const loopRing = () => {
      rx += (cx - rx) * 0.14
      ry += (cy - ry) * 0.14
      ring.style.transform = `translate(calc(${rx}px - 50%), calc(${ry}px - 50%))`
      rafId = requestAnimationFrame(loopRing)
    }

    // Delegated hover detection — works for dynamically rendered elements
    const onOver = (e: MouseEvent) => {
      if ((e.target as Element).closest('a, button, [data-hover]')) {
        document.body.classList.add('cursor-hover')
      }
    }
    const onOut = (e: MouseEvent) => {
      const to = e.relatedTarget as Element | null
      if (!to?.closest('a, button, [data-hover]')) {
        document.body.classList.remove('cursor-hover')
      }
    }

    document.addEventListener('mousemove',  onMove)
    document.addEventListener('mouseover',  onOver)
    document.addEventListener('mouseout',   onOut)
    rafId = requestAnimationFrame(loopRing)

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout',  onOut)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div id="cursor">
      <div id="cursor-dot"  ref={dotRef} />
      <div id="cursor-ring" ref={ringRef} />
    </div>
  )
}
