import type { Metadata } from 'next'
import { Cormorant_Garamond, Raleway } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Providers } from './providers'
import { CustomCursor } from '@/components/ui/custom-cursor'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets:  ['latin'],
  weight:   ['300', '400', '600', '700'],
  style:    ['normal', 'italic'],
  variable: '--font-cormorant',
  display:  'swap',
  preload:  false,
})

const raleway = Raleway({
  subsets:  ['latin'],
  weight:   ['300', '400', '500', '600'],
  variable: '--font-raleway',
  display:  'swap',
  preload:  false,
})

export const metadata: Metadata = {
  title: 'Arvista 3D — Experiencias Artísticas',
  description: 'Plataforma de galerías virtuales donde artistas exponen sus obras en experiencias 3D inmersivas.',
  icons: {
    icon: '/icon.svg',
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider proxyUrl={process.env.NEXT_PUBLIC_CLERK_PROXY_URL}>
      <html lang="es" className={`${cormorant.variable} ${raleway.variable}`} data-scroll-behavior="smooth">
        <body className="font-sans bg-bg text-ink">
          <Providers>
            <CustomCursor />
            {children}
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}
