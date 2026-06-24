'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="es">
      <body className="min-h-screen flex items-center justify-center bg-[#f0ece6]">
        <div className="text-center px-6">
          <p className="font-serif text-[64px] opacity-10 mb-6">◇</p>
          <h2 className="font-serif text-[28px] font-bold mb-3">Algo ha salido mal</h2>
          <p className="text-[14px] text-[oklch(60%_0.010_75)] mb-6">
            El error ha sido registrado. Puedes intentarlo de nuevo.
          </p>
          <button
            onClick={reset}
            className="text-[13px] px-6 py-2.5 bg-[oklch(14%_0.010_75)] text-[oklch(97%_0.005_75)] hover:-translate-y-px transition-all"
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  )
}
