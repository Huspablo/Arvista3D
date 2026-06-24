/**
 * seed-admin.mjs
 *
 * Crea (o idempotentemente reutiliza) el usuario admin en Clerk y fija su plan
 * a PREMIUM en la base de datos local.
 *
 * Uso:  npm run db:seed-admin
 */

import dotenv from 'dotenv'
import { resolve } from 'path'
import { createClerkClient } from '@clerk/backend'
import { PrismaClient }      from '@prisma/client'

// Carga .env.local (Next.js) y luego .env como fallback
dotenv.config({ path: resolve(process.cwd(), '.env.local'), override: true })
dotenv.config({ path: resolve(process.cwd(), '.env') })

// ── Credenciales del admin ────────────────────────────────────────────────────
const ADMIN_EMAIL    = 'admin@arvista3d.dev'
const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'Arvista3D!'
const ADMIN_NAME     = 'Admin'

// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  const secretKey = process.env.CLERK_SECRET_KEY
  if (!secretKey) {
    console.error('❌  CLERK_SECRET_KEY no encontrado en las variables de entorno.')
    process.exit(1)
  }

  const clerk  = createClerkClient({ secretKey })
  const prisma = new PrismaClient()

  // ── 1. Buscar o crear usuario en Clerk ────────────────────────────────────
  let clerkUserId

  try {
    const existing = await clerk.users.getUserList({ emailAddress: [ADMIN_EMAIL] })

    if (existing.data.length > 0) {
      clerkUserId = existing.data[0].id
      // Actualiza la contraseña por si cambió (o era la anterior "admin")
      await clerk.users.updateUser(clerkUserId, {
        password:           ADMIN_PASSWORD,
        skipPasswordChecks: true,
      })
      console.log(`✓ Usuario Clerk actualizado →  ${clerkUserId}`)
    } else {
      const user = await clerk.users.createUser({
        emailAddress:       [ADMIN_EMAIL],
        username:           ADMIN_USERNAME,   // requiere "Username" activo en el dashboard
        password:           ADMIN_PASSWORD,
        firstName:          ADMIN_NAME,
        skipPasswordChecks: true,             // permite contraseñas cortas en seeds
      })
      clerkUserId = user.id
      console.log(`✓ Usuario Clerk creado     →  ${clerkUserId}`)
    }
  } catch (err) {
    const errors = err?.errors ?? []
    const isUsernameError = errors.some(e => e.code?.includes('username'))

    if (isUsernameError) {
      // Clerk no tiene "Username" activado — reintenta sin ese campo
      console.log('⚠  "Username" no está activado en este proyecto Clerk; creando solo con email…')
      try {
        const user = await clerk.users.createUser({
          emailAddress:       [ADMIN_EMAIL],
          password:           ADMIN_PASSWORD,
          firstName:          ADMIN_NAME,
          skipPasswordChecks: true,
        })
        clerkUserId = user.id
        console.log(`✓ Usuario Clerk creado (sin username)  →  ${clerkUserId}`)
        console.log(`  Para activar username: Clerk Dashboard → User & Authentication → Username`)
      } catch (err2) {
        console.error('❌  Error al crear usuario en Clerk:')
        console.error(err2?.errors ?? err2?.message ?? err2)
        await prisma.$disconnect()
        process.exit(1)
      }
    } else {
      console.error('❌  Error al crear usuario en Clerk:')
      console.error(errors.length ? errors : err?.message ?? err)
      await prisma.$disconnect()
      process.exit(1)
    }
  }

  // ── 2. Crear o actualizar el artista en BD con plan PREMIUM ───────────────
  try {
    const artist = await prisma.artist.upsert({
      where:  { clerkId: clerkUserId },
      update: { name: ADMIN_NAME, plan: 'PREMIUM' },
      create: { clerkId: clerkUserId, name: ADMIN_NAME, plan: 'PREMIUM' },
    })
    console.log(`✓ Artista en BD             →  plan=${artist.plan}  id=${artist.id}`)
  } catch (err) {
    console.error('❌  Error al crear artista en BD:', err.message ?? err)
    await prisma.$disconnect()
    process.exit(1)
  }

  await prisma.$disconnect()

  // ── Resumen ───────────────────────────────────────────────────────────────
  console.log('')
  console.log('╔═══════════════════════════════════════════╗')
  console.log('║          Admin listo para usar            ║')
  console.log('╠═══════════════════════════════════════════╣')
  console.log(`║  Email    :  ${ADMIN_EMAIL.padEnd(29)}║`)
  console.log(`║  Username :  ${ADMIN_USERNAME.padEnd(29)}║`)
  console.log(`║  Password :  ${ADMIN_PASSWORD.padEnd(29)}║`)
  console.log(`║  Plan     :  PREMIUM (3 galerías · 50 obras)║`)
  console.log('╚═══════════════════════════════════════════╝')
  console.log('')
  console.log('→ Accede desde: http://localhost:3000/sign-in')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
