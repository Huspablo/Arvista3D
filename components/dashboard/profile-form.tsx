'use client'

import { useState } from 'react'

interface FormErrors {
  displayName?: string
  website?:     string
}

const SOCIAL_LINKS = [
  { key: 'instagram', label: 'Instagram',  prefix: 'instagram.com/' },
  { key: 'twitter',   label: 'X / Twitter', prefix: 'x.com/'         },
  { key: 'website',   label: 'Sitio web',   prefix: 'https://'        },
]

export function ProfileForm() {
  const [displayName, setDisplayName] = useState('Mariana López')
  const [bio,         setBio]         = useState('Artista visual basada en Madrid. Mi trabajo explora texturas, espacios urbanos y la relación entre materia y luz.')
  const [location,    setLocation]    = useState('Madrid, España')
  const [instagram,   setInstagram]   = useState('marianalopezart')
  const [twitter,     setTwitter]     = useState('')
  const [website,     setWebsite]     = useState('')
  const [errors,      setErrors]      = useState<FormErrors>({})
  const [saved,       setSaved]       = useState(false)

  const validate = () => {
    const e: FormErrors = {}
    if (!displayName.trim()) e.displayName = 'El nombre público es obligatorio'
    if (website && !website.startsWith('http')) e.website = 'Incluye https://'
    return e
  }

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <form onSubmit={handleSubmit} className="max-w-190">

      {/* Avatar row */}
      <div className="flex items-center gap-6 mb-10 pb-10 border-b border-(--border) reveal">
        <div className="w-20 h-20 border border-(--border) bg-bg2 flex items-center justify-center shrink-0">
          <span className="font-serif text-[28px] font-bold text-ink3">{initials}</span>
        </div>
        <div>
          <p className="text-[13px] text-ink3 mb-2">Foto de perfil — visible en tu galería pública</p>
          <button
            type="button"
            className="text-[12px] px-4 py-1.75 border border-(--border) text-ink3 hover:border-(--border-md) hover:text-ink transition-all"
          >
            Cambiar foto
          </button>
        </div>
      </div>

      {/* Public info */}
      <section className="mb-10 reveal rd1">
        <h2 className="font-serif text-[20px] font-bold mb-5">Información pública</h2>
        <div className="grid gap-5">

          <div>
            <label className="block text-[11px] tracking-[2px] uppercase text-ink3 mb-2.5">
              Nombre público <span className="text-warn">*</span>
            </label>
            <input
              type="text"
              value={displayName}
              onChange={e => { setDisplayName(e.target.value); setErrors(v => ({ ...v, displayName: undefined })) }}
              className={`w-full border bg-bg3 text-ink text-[14px] px-4 py-3 outline-none transition-colors placeholder:text-ink3 ${
                errors.displayName ? 'border-warn' : 'border-(--border) focus:border-(--border-md)'
              }`}
            />
            {errors.displayName && <p className="text-[12px] text-warn mt-1.5">{errors.displayName}</p>}
          </div>

          <div>
            <label className="block text-[11px] tracking-[2px] uppercase text-ink3 mb-2.5">Ubicación</label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Ciudad, País"
              className="w-full border border-(--border) bg-bg3 text-ink text-[14px] px-4 py-3 outline-none focus:border-(--border-md) transition-colors placeholder:text-ink3"
            />
          </div>

          <div>
            <label className="block text-[11px] tracking-[2px] uppercase text-ink3 mb-2.5">Sobre mí</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={5}
              maxLength={500}
              placeholder="Cuéntale a los visitantes quién eres y qué haces…"
              className="w-full border border-(--border) bg-bg3 text-ink text-[14px] px-4 py-3 outline-none resize-none focus:border-(--border-md) transition-colors placeholder:text-ink3"
            />
            <p className="text-[11px] text-ink3 mt-1.5">{bio.length} / 500 caracteres</p>
          </div>
        </div>
      </section>

      {/* Links */}
      <section className="mb-10 reveal rd2">
        <h2 className="font-serif text-[20px] font-bold mb-5">Redes y sitio web</h2>
        <div className="grid gap-4">

          <div>
            <label className="block text-[11px] tracking-[2px] uppercase text-ink3 mb-2.5">Instagram</label>
            <div className="flex items-stretch border border-(--border) focus-within:border-(--border-md) transition-colors">
              <span className="px-3 py-3 bg-bg2 border-r border-(--border) text-[13px] text-ink3 flex items-center select-none">
                instagram.com/
              </span>
              <input
                type="text"
                value={instagram}
                onChange={e => setInstagram(e.target.value)}
                placeholder="tu_usuario"
                className="flex-1 bg-bg3 text-ink text-[14px] px-3 py-3 outline-none placeholder:text-ink3"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] tracking-[2px] uppercase text-ink3 mb-2.5">X / Twitter</label>
            <div className="flex items-stretch border border-(--border) focus-within:border-(--border-md) transition-colors">
              <span className="px-3 py-3 bg-bg2 border-r border-(--border) text-[13px] text-ink3 flex items-center select-none">
                x.com/
              </span>
              <input
                type="text"
                value={twitter}
                onChange={e => setTwitter(e.target.value)}
                placeholder="tu_usuario"
                className="flex-1 bg-bg3 text-ink text-[14px] px-3 py-3 outline-none placeholder:text-ink3"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] tracking-[2px] uppercase text-ink3 mb-2.5">Sitio web</label>
            <input
              type="url"
              value={website}
              onChange={e => { setWebsite(e.target.value); setErrors(v => ({ ...v, website: undefined })) }}
              placeholder="https://tu-sitio.com"
              className={`w-full border bg-bg3 text-ink text-[14px] px-4 py-3 outline-none transition-colors placeholder:text-ink3 ${
                errors.website ? 'border-warn' : 'border-(--border) focus:border-(--border-md)'
              }`}
            />
            {errors.website && <p className="text-[12px] text-warn mt-1.5">{errors.website}</p>}
          </div>
        </div>
      </section>

      {/* Account info (read-only) */}
      <section className="mb-10 p-5 border border-(--border) bg-bg2 reveal rd3">
        <h2 className="font-serif text-[18px] font-bold mb-4">Cuenta</h2>
        <div className="grid gap-3 text-[13px]">
          <div className="flex justify-between">
            <span className="text-ink3">Email</span>
            <span className="text-ink">huspablo11@gmail.com</span>
          </div>
          <div className="h-px bg-(--border)" />
          <div className="flex justify-between">
            <span className="text-ink3">Miembro desde</span>
            <span className="text-ink">Enero 2024</span>
          </div>
          <div className="h-px bg-(--border)" />
          <div className="flex justify-between items-center">
            <span className="text-ink3">Contraseña</span>
            <button type="button" className="text-[12px] text-ink3 border-b border-(--border) hover:text-ink hover:border-(--border-md) transition-all">
              Cambiar contraseña →
            </button>
          </div>
        </div>
      </section>

      {/* Save */}
      <div className="flex items-center gap-4 reveal rd4">
        <button
          type="submit"
          className="relative overflow-hidden text-[13px] px-7 py-2.75 rounded-xs text-bg bg-ink font-medium hover:-translate-y-px transition-all ease-[cubic-bezier(.22,1,.36,1)] group"
        >
          <span className="absolute inset-0 bg-gold -translate-x-full group-hover:translate-x-0 transition-transform duration-400 ease-[cubic-bezier(.22,1,.36,1)]" />
          <span className="relative z-1">Guardar cambios</span>
        </button>
        {saved && (
          <span className="text-[13px] text-ok transition-opacity">
            ✓ Cambios guardados
          </span>
        )}
      </div>
    </form>
  )
}
