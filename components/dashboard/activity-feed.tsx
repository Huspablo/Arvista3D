const ACTIVITY = [
  { type: 'gold', text: <><strong className="font-medium">Espiral #3</strong> recibió 3 nuevas visitas</>,   time: 'hace 1h'  },
  { type: 'ok',   text: <>Galería <strong className="font-medium">Texturas urbanas</strong> actualizada</>,  time: 'hace 3h'  },
  { type: 'gold', text: <>Nuevo contacto sobre <strong className="font-medium">Bruma I</strong></>,          time: 'ayer'     },
  { type: 'warn', text: <>Límite de obras alcanzado — considera mejorar tu plan</>,                          time: 'ayer'     },
  { type: 'ok',   text: <><strong className="font-medium">Raíz doble</strong> publicada en galería</>,       time: 'hace 3d'  },
]

const DOT_COLORS: Record<string, string> = {
  gold: 'var(--color-gold)',
  ok:   'var(--color-ok)',
  warn: 'var(--color-warn)',
}

export function ActivityFeed() {
  return (
    <div>
      <div className="flex items-center justify-between mb-5 reveal">
        <span className="font-serif text-[22px] font-bold">Actividad reciente</span>
      </div>
      <div className="border border-(--border) reveal rd1">
        {ACTIVITY.map((a) => (
          <div
            key={`${a.type}-${a.time}`}
            className="flex items-center gap-4 px-5 py-4 border-b border-(--border) last:border-b-0 hover:bg-bg2 transition-colors group"
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: DOT_COLORS[a.type] }}
            />
            <span className="flex-1 text-[14px] leading-[1.4] text-ink">{a.text}</span>
            <span className="text-[12px] text-ink3 whitespace-nowrap">{a.time}</span>
            <span className="text-ink3 text-[16px] transition-transform group-hover:translate-x-0.75">→</span>
          </div>
        ))}
      </div>
    </div>
  )
}
