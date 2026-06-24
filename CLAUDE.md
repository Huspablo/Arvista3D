# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

**Arvista 3D** — plataforma de galerías virtuales donde artistas gestionan y exponen sus obras, y los visitantes las recorren en 3D.

Documentación completa en [docs/](docs/):
- Reglas de negocio: [docs/BUSINESS_RULES.md](docs/BUSINESS_RULES.md)
- Stack tecnológico: [docs/STACK.md](docs/STACK.md)
- Contrato del viewer: [docs/GALLERY_MANIFEST.md](docs/GALLERY_MANIFEST.md)
- Estado del proyecto: [docs/STATUS.md](docs/STATUS.md)
- Guía de prueba manual: [docs/TESTING_MANUAL.md](docs/TESTING_MANUAL.md)

## Dominio central

Relación principal: **Artista → Galerías → Obras**

| Entidad | Clave |
|---|---|
| Artista | Propietario del contenido, tiene un plan de suscripción |
| Galería | Pertenece a un artista, pública o privada, tiene posiciones (slots) |
| Obra | Pertenece a un artista, puede estar expuesta (EXPOSED) o en borrador (DRAFT) |
| Suscripción | Limita nº de galerías y obras expuestas por galería |

**Planes (fuente de verdad: `lib/services/artist.service.ts` → `PLAN_LIMITS`):**
- Básico: 1 galería, 10 obras/galería
- Estándar: 2 galerías, 20 obras/galería
- Premium: 3 galerías, 50 obras/galería

**Tipos de obra:** PAINTING, SCULPTURE, PHOTOGRAPHY, OTHER.

## Reglas de negocio críticas

1. Un artista solo gestiona su propio contenido (galerías y obras).
2. Una obra solo puede exponerse en una galería del mismo artista.
3. Publicar una obra requiere: propiedad correcta + galería válida + límite no alcanzado + posición compatible libre.
4. Retirar una obra libera su slot y la deja en estado DRAFT.
5. La capacidad se cuenta sobre obras **EXPOSED**, no sobre las DRAFT.
6. Los visitantes solo acceden a galerías **PUBLIC**.
7. `viewCount` se incrementa cada vez que un visitante accede a la página pública de una obra (`GET /api/artworks/[id]/public`).

## Roles de usuario

- **Artista** (autenticado): gestiona perfil, galerías y obras dentro de su plan.
- **Visitante**: navega galerías públicas, consulta obras expuestas, sin crear contenido.

## Stack tecnológico

Stack completo en [docs/STACK.md](docs/STACK.md). Resumen:

| Capa | Tecnología | Nota |
|---|---|---|
| Plataforma web | Next.js 16 (App Router) + React 19 + TypeScript 6 | |
| Viewer 3D | Three.js + React Three Fiber + Drei | |
| UI 2D | Tailwind CSS v4 + componentes propios | Ver convenciones abajo |
| Estado local | `useState` / `useRef` | Zustand **no se usa** — no es necesario para el viewer actual |
| Datos remotos | TanStack Query v5 | Solo en dashboard (Client Components) |
| Backend | Next.js Route Handlers + servicios en `lib/services/` | |
| Jobs asíncronos | Inngest v4 | `triggers` va dentro de `options`, no como 3er arg |
| Base de datos | PostgreSQL (Neon) + Prisma v5 | |
| Auth | Clerk v7 | `proxy.ts` (no `middleware.ts` — Next.js 16) |
| Billing | Stripe Billing v22 | API version `2026-03-25.dahlia` |
| Storage + CDN | Cloudflare R2 + CDN | Upload directo con URL prefirmada |
| Imagen | Sharp | 3 derivados webp: thumbnail 400px / gallery 1200px / detail 2400px |
| Observabilidad | Sentry v10 | DSN EU region (`ingest.de.sentry.io`) |
| Testing | Vitest v4 | `npm test` — 33 tests, 4 archivos en `__tests__/` |

## Arquitectura clave

- **Gallery Manifest**: el backend entrega un manifest semántico (plantilla + slots + obras + recursos) que el viewer consume. La escena no se guarda. Contrato completo en [docs/GALLERY_MANIFEST.md](docs/GALLERY_MANIFEST.md).
- **Pipeline por tipo de obra**: pinturas/fotos → plano con textura (`WALL_PLANE`); esculturas → modelo GLB en pedestal (`FLOOR_MODEL`). El manifest especifica el `displayMode` por slot; el viewer no lo infiere.
- **Assets**: subida directa a R2 con URL prefirmada → procesamiento asíncrono con Inngest → derivados webp servidos desde CDN.
- **Caché manifest**: `unstable_cache` con tag `manifest-{galleryId}`. Se invalida con `revalidateTag(tag, {})` (Next.js 16 requiere 2 args) al publicar/retirar/actualizar galería.
- **Obras destacadas en landing**: Server Component que consulta BD ordenando por `viewCount desc`, límite 6. Estado vacío elegante mientras no hay datos.

## Estructura de ficheros clave

```
lib/
  services/          # Lógica de negocio (servicios de dominio)
    artist.service.ts    ← PLAN_LIMITS (fuente de verdad de límites)
    gallery.service.ts   ← assertGalleryQuota, createGallery, deleteGallery
    artwork.service.ts   ← publishArtwork (4 condiciones), unpublishArtwork
    manifest.service.ts  ← buildManifest con unstable_cache
  schemas/           # Validación Zod de todos los Route Handlers
  hooks/             # TanStack Query: useArtist, useGalleries, useArtworks
  api-helpers.ts     # requireArtist() + serviceErrorToResponse() + Sentry
  db.ts              # Singleton de Prisma
  stripe.ts          # Cliente Stripe + mapas Plan↔PriceID
  inngest.ts         # Cliente Inngest + tipos de eventos
  r2.ts              # Cliente R2 + cdnUrl()
  functions/
    process-artwork-upload.ts  ← Inngest function (pipeline Sharp)

app/api/             # 16 Route Handlers
  artists/me/
  galleries/[id]/, galleries/[id]/manifest/
  artworks/, artworks/[id]/, artworks/[id]/publish|unpublish|trigger-processing
  artworks/public/, artworks/[id]/public/
  assets/presigned-url/
  inngest/
  stripe/checkout/, stripe/portal/
  webhooks/stripe/

__tests__/
  unit/services/     # artwork, gallery, manifest
  integration/api/   # artworks (handlers)
```

## Diseño del dominio

- Esquema de BD: [prisma/schema.prisma](prisma/schema.prisma)
- Contrato viewer: [docs/GALLERY_MANIFEST.md](docs/GALLERY_MANIFEST.md)

## Convenciones Tailwind CSS (v4)

Este proyecto usa Tailwind v4. Seguir siempre la sintaxis canónica.

### Variables CSS
- Variables de `@theme` en `globals.css` tienen utilidades directas: usar `text-warn`, `text-ok`, `bg-warn`, `bg-ok`, `text-gold`, `bg-gold`, etc. **Nunca** `text-(--color-warn)`.
- Variables de `:root` (con opacidad) se referencian con `(--border)`, `(--gold-dim)`, etc.

### Valores arbitrarios → escala Tailwind
- **Espaciado**: 1 unidad = 4 px. `[8px]` → `2`, `[10px]` → `2.5`, `[60px]` → `15`, `[1px]` → `px`.
- **Border radius**: `[2px]` → `rounded-xs`.
- **Duración**: `[400ms]` → `duration-400`, `[700ms]` → `duration-700`.
- **Z-index**: `z-[5]` → `z-5`.

### Colores oklch con alfa
```
border-[oklch(56%_0.14_155/0.2)]   ✓
border-[oklch(56%_0.14_155_/_0.2)] ✗
```

### Modificador `!important`
```
max-md:col-[span_1]!   ✓
max-md:!col-[span_1]   ✗
```

### Transiciones
Evitar combinar `transition-shadow` + `transition-colors` en el mismo elemento — usar `transition`.

## Convenciones de código

- `revalidateTag(tag, {})` — siempre 2 argumentos (Next.js 16).
- Inngest v4: `createFunction({ id, triggers: [{ event }] }, handler)` — trigger dentro de `options`.
- Stripe SDK v22: `apiVersion: '2026-03-25.dahlia'`.
- Mocks en Vitest: usar `vi.hoisted()` para variables referenciadas dentro de `vi.mock()`.
- Errores de servicios: prefijo del mensaje determina el HTTP status en `serviceErrorToResponse()`.
  - `FORBIDDEN` → 403, `GALLERY_LIMIT` → 403, `CAPACITY_REACHED` → 403, `NO_SLOT` → 409, `INVALID_STATE` → 409, `GALLERY_NOT_FOUND` → 404.
- **Avatar del artista**: usar `artist.avatarUrl` (campo en BD, gestionado desde `/dashboard/profile`), **no** `user.imageUrl` de Clerk. El Topbar, el perfil público y cualquier lugar que muestre la foto del artista usan esta fuente.
- **Tarjetas 3D con `.reveal`**: el efecto `perspective rotateX/Y` en hover requiere **dos wrappers**. El wrapper exterior tiene `.reveal` (para la animación de entrada con `IntersectionObserver`); el wrapper interior tiene el `ref` y los handlers de mouse con `el.style.setProperty('--rx', ...)`. No combinar ambos en el mismo elemento — el CSS de `.reveal` usa `transform: translateY` que el JS sobreescribiría.
- **Formularios de obra**: layout `px-12 py-10 flex gap-14` — sidebar imagen fijo izquierdo `w-65 aspect-square self-start sticky top-14.25`, formulario a la derecha `flex-1 max-w-115`. La imagen no debe ir full-bleed junto al sidebar de navegación.
