import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'

export default function SignInPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1fr_480px]">

      {/* ── Panel izquierdo — marca ── */}
      <div className="hidden lg:flex flex-col justify-between bg-ink text-bg p-16 relative overflow-hidden">

        {/* Textura punteada de fondo */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, oklch(97% 0.007 75) 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />

        {/* Diamante decorativo */}
        <div className="absolute -right-24 top-1/2 -translate-y-1/2 text-[320px] text-bg opacity-[0.03] font-serif select-none pointer-events-none leading-none">
          ◇
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 group w-fit">
            <span className="font-serif text-xl text-gold group-hover:opacity-80 transition-opacity">◇</span>
            <span className="text-[11px] tracking-[4px] uppercase text-bg/60">Arvista 3D</span>
          </Link>
        </div>

        {/* Copy central */}
        <div className="relative z-10 space-y-8">
          <div>
            <p className="text-[10px] tracking-[3px] uppercase text-gold mb-6">Galerías virtuales</p>
            <h1 className="font-serif text-[52px] leading-[1.1] font-black mb-6">
              Tu obra.<br />
              Tu espacio.<br />
              <span className="text-gold">Sin límites.</span>
            </h1>
            <p className="text-[15px] text-bg/50 leading-relaxed max-w-sm">
              Crea galerías 3D inmersivas, expone tu colección y comparte tu arte con el mundo.
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-10 pt-6 border-t border-bg/10">
            <div>
              <p className="font-serif text-[28px] font-black text-gold">3D</p>
              <p className="text-[11px] text-bg/40 tracking-wide mt-1">Viewer inmersivo</p>
            </div>
            <div>
              <p className="font-serif text-[28px] font-black">CDN</p>
              <p className="text-[11px] text-bg/40 tracking-wide mt-1">Assets optimizados</p>
            </div>
            <div>
              <p className="font-serif text-[28px] font-black">∞</p>
              <p className="text-[11px] text-bg/40 tracking-wide mt-1">Obras catalogadas</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-[11px] text-bg/25 tracking-wide">© 2026 Arvista 3D</p>
        </div>
      </div>

      {/* ── Panel derecho — formulario ── */}
      <div className="flex flex-col min-h-screen bg-bg">

        {/* Nav superior */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-(--border) lg:border-none">
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <span className="font-serif text-gold">◇</span>
            <span className="text-[10px] tracking-[3px] uppercase text-ink3">Arvista 3D</span>
          </Link>
          <div className="hidden lg:block" />
          <Link
            href="/"
            className="text-[12px] tracking-wide text-ink3 hover:text-ink transition-colors flex items-center gap-1.5"
          >
            <span className="text-[10px]">←</span>
            Volver al inicio
          </Link>
        </div>

        {/* Formulario */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <p className="text-[10px] tracking-[3px] uppercase text-ink3 mb-3">Acceso</p>
              <h2 className="font-serif text-[32px] font-black leading-tight">Bienvenido de nuevo</h2>
            </div>

            <SignIn
              appearance={{
                variables: {
                  colorPrimary:         'oklch(14% 0.010 75)',
                  colorBackground:      'oklch(97.5% 0.007 75)',
                  colorText:            'oklch(14% 0.010 75)',
                  colorTextSecondary:   'oklch(60% 0.010 75)',
                  colorInputText:       'oklch(14% 0.010 75)',
                  colorInputBackground: 'oklch(95% 0.010 75)',
                  colorNeutral:         'oklch(14% 0.010 75)',
                  borderRadius:         '0px',
                  fontSize:             '14px',
                  fontFamily:           'var(--font-raleway), sans-serif',
                  fontWeight:           { normal: 300, medium: 400, bold: 500 },
                },
                elements: {
                  rootBox:              'w-full',
                  card:                 'shadow-none p-0 bg-transparent gap-5 w-full',
                  header:               'hidden',
                  headerTitle:          'hidden',
                  headerSubtitle:       'hidden',
                  logoBox:              'hidden',
                  logoImage:            'hidden',
                  socialButtonsBlockButton:     'border border-(--border) hover:bg-bg2 transition-colors h-11',
                  socialButtonsBlockButtonText: 'text-[13px] font-normal',
                  dividerLine:          'bg-(--border)',
                  dividerText:          'text-ink3 text-[11px] tracking-widest uppercase',
                  formFieldLabel:       'text-[11px] tracking-[2px] uppercase text-ink3 mb-1',
                  formFieldInput:       'border border-(--border) bg-bg2 focus:border-ink h-11 text-[13px] transition-colors',
                  formButtonPrimary:    'bg-ink hover:bg-ink2 h-11 text-[13px] font-normal tracking-wide transition-colors',
                  footerActionText:     'text-ink3 text-[13px]',
                  footerActionLink:     'text-gold hover:text-gold-hi transition-colors font-normal',
                  identityPreviewText:  'text-[13px]',
                  identityPreviewEditButton: 'text-gold',
                  formFieldSuccessText: 'text-ok text-[12px]',
                  formFieldErrorText:   'text-warn text-[12px]',
                  footer:               'bg-transparent',
                  footerPages:          'bg-transparent',
                  internal:             'bg-transparent',
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
