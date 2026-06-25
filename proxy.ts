import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Rutas de API accesibles sin autenticación
const isPublicApi = createRouteMatcher([
  '/api/artworks/public',
  '/api/artworks/:id/public',
  '/api/galleries/public',
  '/api/galleries/:id/manifest',  // el viewer 3D lo consume sin sesión
  '/api/artists/public',
  '/api/assets/texture',          // proxy CORS para texturas Three.js
])

// Todo lo demás bajo /api y /dashboard requiere sesión
const isPrivate = createRouteMatcher([
  '/dashboard(.*)',
  '/api/galleries(.*)',
  '/api/artworks(.*)',
  '/api/artists(.*)',
  '/api/assets(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isPrivate(req) && !isPublicApi(req)) await auth.protect()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
