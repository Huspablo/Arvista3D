import * as THREE from 'three'

type RugStyle = 'classic' | 'minimal' | 'dark'

export function buildRugTexture(style: RugStyle): THREE.CanvasTexture {
  const W = 768, H = 512
  const cv = document.createElement('canvas')
  cv.width = W; cv.height = H
  const c = cv.getContext('2d')!

  if (style === 'classic') {
    // Persian-inspired: deep red + gold geometric borders and medallion
    c.fillStyle = '#3e0e0e'; c.fillRect(0, 0, W, H)
    c.fillStyle = '#6d1a1a'; c.fillRect(18, 18, W - 36, H - 36)

    // Triple gold border strokes
    c.strokeStyle = '#c8a850'; c.lineWidth = 2
    ;[22, 26, 30].forEach(d => c.strokeRect(d, d, W - d * 2, H - d * 2))

    // Dark inner band + lighter interior fill
    c.fillStyle = '#3e0e0e'; c.fillRect(38, 38, W - 76, H - 76)
    c.fillStyle = '#7a1f1f'; c.fillRect(46, 46, W - 92, H - 92)
    c.strokeStyle = '#c8a850'; c.lineWidth = 1.5
    c.strokeRect(50, 50, W - 100, H - 100)

    // Small diamond motifs along inner border
    c.strokeStyle = '#c8a85055'; c.lineWidth = 1
    const step = 32
    for (let x = 54 + step; x < W - 54; x += step) {
      [[x, 54], [x, H - 54]].forEach(([px, py]) => {
        const s = 7
        c.beginPath(); c.moveTo(px, py - s); c.lineTo(px + s, py); c.lineTo(px, py + s); c.lineTo(px - s, py); c.closePath(); c.stroke()
      })
    }
    for (let y = 54 + step; y < H - 54; y += step) {
      [[54, y], [W - 54, y]].forEach(([px, py]) => {
        const s = 7
        c.beginPath(); c.moveTo(px, py - s); c.lineTo(px + s, py); c.lineTo(px, py + s); c.lineTo(px - s, py); c.closePath(); c.stroke()
      })
    }

    // Center medallion — nested diamonds
    const cx = W / 2, cy = H / 2
    ;[72, 52, 32].forEach(r => {
      c.beginPath()
      c.moveTo(cx, cy - r); c.lineTo(cx + r, cy); c.lineTo(cx, cy + r); c.lineTo(cx - r, cy)
      c.closePath(); c.strokeStyle = '#c8a850'; c.lineWidth = r === 72 ? 2 : 1.5; c.stroke()
    })
    // Radial spokes
    c.strokeStyle = '#c8a85070'; c.lineWidth = 1
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4
      c.beginPath()
      c.moveTo(cx + Math.cos(a) * 15, cy + Math.sin(a) * 15)
      c.lineTo(cx + Math.cos(a) * 68, cy + Math.sin(a) * 68)
      c.stroke()
    }
    c.fillStyle = '#c8a850'; c.beginPath(); c.arc(cx, cy, 6, 0, Math.PI * 2); c.fill()

    // Corner ornaments
    ;[[68, 62], [W - 68, 62], [68, H - 62], [W - 68, H - 62]].forEach(([x, y]) => {
      const s = 18
      c.beginPath(); c.moveTo(x, y - s); c.lineTo(x + s, y); c.lineTo(x, y + s); c.lineTo(x - s, y); c.closePath()
      c.fillStyle = '#c8a85040'; c.fill()
      c.strokeStyle = '#c8a850'; c.lineWidth = 1.5; c.stroke()
    })

  } else if (style === 'minimal') {
    // Scandinavian: warm cream + subtle taupe geometry
    c.fillStyle = '#e0d2b8'; c.fillRect(0, 0, W, H)

    c.strokeStyle = '#9a8060'; c.lineWidth = 2.5; c.strokeRect(12, 12, W - 24, H - 24)
    c.lineWidth = 0.8; c.strokeRect(20, 20, W - 40, H - 40)

    // Subtle crosshatch grid
    c.strokeStyle = '#9a806028'; c.lineWidth = 1
    for (let x = 28; x < W; x += 52) { c.beginPath(); c.moveTo(x, 24); c.lineTo(x, H - 24); c.stroke() }
    for (let y = 28; y < H; y += 52) { c.beginPath(); c.moveTo(24, y); c.lineTo(W - 24, y); c.stroke() }

    // Center geometric motif
    const cx = W / 2, cy = H / 2
    c.strokeStyle = '#9a8060'; c.lineWidth = 1.5
    ;[[55, 35], [44, 26]].forEach(([hw, hh]) => c.strokeRect(cx - hw, cy - hh, hw * 2, hh * 2))
    c.beginPath(); c.moveTo(cx - 28, cy); c.lineTo(cx + 28, cy); c.moveTo(cx, cy - 20); c.lineTo(cx, cy + 20); c.stroke()
    c.fillStyle = '#9a8060'; c.beginPath(); c.arc(cx, cy, 4, 0, Math.PI * 2); c.fill()

  } else {
    // Dark / gallery-noir: charcoal + gold
    c.fillStyle = '#1a1610'; c.fillRect(0, 0, W, H)
    c.fillStyle = '#211d16'; c.fillRect(28, 28, W - 56, H - 56)

    // Gold border lines
    c.strokeStyle = '#c8a850'; c.lineWidth = 1.5
    ;[14, 22].forEach(d => c.strokeRect(d, d, W - d * 2, H - d * 2))
    c.strokeStyle = '#c8a85044'; c.lineWidth = 1; c.strokeRect(36, 36, W - 72, H - 72)

    // Diamond grid fill
    c.strokeStyle = '#c8a85030'; c.lineWidth = 1
    for (let gx = 56; gx < W - 28; gx += 52) {
      for (let gy = 52; gy < H - 28; gy += 52) {
        const s = 11
        c.beginPath(); c.moveTo(gx, gy - s); c.lineTo(gx + s, gy); c.lineTo(gx, gy + s); c.lineTo(gx - s, gy); c.closePath(); c.stroke()
      }
    }

    // Center emblem
    const cx = W / 2, cy = H / 2
    c.strokeStyle = '#c8a850'
    ;[[50, 2], [30, 1.5], [14, 1]].forEach(([r, w]) => {
      c.lineWidth = w
      c.beginPath(); c.moveTo(cx, cy - r); c.lineTo(cx + r, cy); c.lineTo(cx, cy + r); c.lineTo(cx - r, cy); c.closePath(); c.stroke()
    })
    // Radial lines
    c.strokeStyle = '#c8a85055'; c.lineWidth = 1
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4
      c.beginPath()
      c.moveTo(cx + Math.cos(a) * 18, cy + Math.sin(a) * 18)
      c.lineTo(cx + Math.cos(a) * 45, cy + Math.sin(a) * 45)
      c.stroke()
    }
    c.fillStyle = '#c8a850'; c.beginPath(); c.arc(cx, cy, 5, 0, Math.PI * 2); c.fill()
  }

  const tex = new THREE.CanvasTexture(cv)
  tex.anisotropy = 8
  return tex
}
