import type { Metadata } from 'next'
import { Cormorant_Garamond, Raleway } from 'next/font/google'
import { CustomCursor } from '@/components/ui/custom-cursor'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const raleway = Raleway({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-raleway',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Arvista 3D — Experiencias Artísticas',
  description: 'Plataforma de galerías virtuales donde artistas exponen sus obras en experiencias 3D inmersivas.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${cormorant.variable} ${raleway.variable}`} data-scroll-behavior="smooth">
      <body className="font-sans bg-bg text-ink">
        <CustomCursor />
        {children}
      </body>
    </html>
  )
}
