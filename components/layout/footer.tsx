import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-(--border) px-15 py-9 flex justify-between items-center max-md:flex-col max-md:gap-5 max-md:text-center max-md:px-6 max-md:py-8">
      <div className="font-serif text-[18px] font-bold text-ink2">
        Arvista <span className="text-gold">3D</span>
      </div>
      <div className="flex gap-7">
        {['Privacidad', 'Términos', 'Contacto'].map(label => (
          <Link key={label} href="#" className="text-ink3 text-[13px] no-underline hover:text-ink transition-colors">
            {label}
          </Link>
        ))}
      </div>
      <div className="text-[13px] text-ink3">© 2025 Arvista 3D</div>
    </footer>
  )
}
