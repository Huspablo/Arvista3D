'use client'

import { useEffect } from 'react'

export function ScrollReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target) }
      }),
      { threshold: 0.07, rootMargin: '0px 0px -40px 0px' }
    )

    const observeNew = (root: Element | Document) =>
      root.querySelectorAll<Element>('.reveal:not(.in)').forEach(el => obs.observe(el))

    // Elementos ya en el DOM al montar
    observeNew(document)

    // Vigila nuevos elementos .reveal añadidos dinámicamente (p.ej. tras fetch async)
    const mutObs = new MutationObserver(mutations => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType !== 1) continue
          const el = node as Element
          if (el.classList.contains('reveal') && !el.classList.contains('in')) obs.observe(el)
          el.querySelectorAll<Element>('.reveal:not(.in)').forEach(child => obs.observe(child))
        }
      }
    })

    mutObs.observe(document.body, { childList: true, subtree: true })

    return () => { obs.disconnect(); mutObs.disconnect() }
  }, [])

  return null
}
