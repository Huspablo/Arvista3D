/**
 * set-premium.mjs
 *
 * Da plan PREMIUM al artista asociado a un email de Clerk.
 *
 * Uso:  npm run db:set-premium -- tu@email.com
 */

import dotenv from 'dotenv'
import { resolve } from 'path'
import { createClerkClient } from '@clerk/backend'
import { PrismaClient }      from '@prisma/client'

dotenv.config({ path: resolve(process.cwd(), '.env.local'), override: true })
dotenv.config({ path: resolve(process.cwd(), '.env') })

const email = process.argv[2]
if (!email) {
  console.error('Uso: npm run db:set-premium -- tu@email.com')
  process.exit(1)
}

const clerk  = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
const prisma = new PrismaClient()

const result = await clerk.users.getUserList({ emailAddress: [email] })
if (result.data.length === 0) {
  console.error(`❌  No existe ningún usuario de Clerk con el email: ${email}`)
  await prisma.$disconnect()
  process.exit(1)
}

const clerkId = result.data[0].id
const artist  = await prisma.artist.upsert({
  where:  { clerkId },
  update: { plan: 'PREMIUM' },
  create: { clerkId, plan: 'PREMIUM' },
})

await prisma.$disconnect()

console.log(`✓ ${email}  →  plan=${artist.plan}`)
console.log('Ya puedes acceder con tu cuenta habitual y tendrás el máximo de galerías y obras.')
