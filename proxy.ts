import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Rutas que requieren autenticación
const isPrivate = createRouteMatcher([
  '/dashboard(.*)',
  '/api/galleries(.*)',  // escritura — las lecturas públicas se protegen en el handler
  '/api/artworks(.*)',
  '/api/artists(.*)',
  '/api/assets(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isPrivate(req)) await auth.protect()
})

export const config = {
  matcher: [
    // Ejecutar en todas las rutas excepto archivos estáticos y _next
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
