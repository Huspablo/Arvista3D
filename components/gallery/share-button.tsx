'use client'

import { useState } from 'react'

interface Props {
  isPublic: boolean
}

export function ShareButton({ isPublic }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (!isPublic) return
    const url = typeof window !== 'undefined' ? window.location.href : ''
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    }).catch(() => {})
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={!isPublic}
      title={isPublic ? 'Copiar enlace de la galería' : 'Publica la galería para poder compartirla'}
      className={`flex items-center justify-center gap-2 text-[13px] px-5 py-3 border-[1.5px] rounded-xs transition-all max-md:flex-1 ${
        isPublic
          ? 'border-(--border-md) text-ink hover:border-ink hover:-translate-y-px cursor-pointer'
          : 'border-(--border) text-ink3 opacity-40 cursor-not-allowed'
      }`}
    >
      {copied ? (
        <>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 7l3 3 6-6"/>
          </svg>
          ¡Copiado!
        </>
      ) : (
        <>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M8 2H5a1 1 0 00-1 1v7a1 1 0 001 1h5a1 1 0 001-1V5l-3-3z"/>
            <path d="M8 2v3h3"/>
          </svg>
          Compartir
        </>
      )}
    </button>
  )
}
