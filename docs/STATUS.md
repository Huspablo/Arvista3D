# Arvista 3D — Estado del proyecto

> Última revisión: 2026-06-24

---

## ✅ Completado

### Frontend — Landing page (`/`)
- Hero con imagen real, parallax y estadísticas animadas
- Ticker, Manifiesto, Features, CTA
- **Obras destacadas**: Server Component — consulta BD, ordena por `viewCount desc`, límite 6, estado vacío elegante si no hay obras aún
- Nav responsive, Footer, ScrollReveal, cursor personalizado
- Sin datos mock — sección artistas y showcase estáticos eliminados

### Frontend — Autenticación
- Páginas `/sign-in` y `/sign-up` con diseño split-screen branded
- Panel izquierdo: marca, copy, stats sobre fondo `bg-ink`
- Panel derecho: formulario Clerk con estilos del proyecto
- `proxy.ts` (Next.js 16) protege `/dashboard/*` y `/api/galleries|artworks|artists|assets`

### Frontend — Dashboard (`/dashboard/*`) — datos reales

#### Obras (`/dashboard/artworks`)
- Listado real con **efecto de tarjeta 3D** en hover: `perspective(800px) rotateX/Y` manejado con DOM directo (`el.style.setProperty('--rx', ...)`) sin re-renders; patrón de dos wrappers para compatibilizar con `.reveal` (outer) y la perspectiva JS (inner)
- Brillo radial en hover: `radial-gradient(circle at var(--mx) var(--my), oklch(100% 0 0 / 0.12), transparent 55%)` actualizado vía CSS custom properties
- Animaciones de entrada ScrollReveal con `.reveal` y delays escalonados `rd1`–`rd4`
- Acciones Exponer/Retirar funcionales, modal de selección de galería, eliminar
- `TYPE_LABEL` importado desde `lib/labels.ts` (no local)
- Texto de carga explícito: "Publicando…" / "Retirando…" (en lugar de '…')
- Botones con `cursor-wait` + `opacity-60` durante la operación pending
- Focus trap en modales de selección de galería y confirmación de borrado (`lib/hooks/use-focus-trap.ts`)

#### Formulario nueva obra (`/dashboard/artworks/new`)
- **Layout editorial**: `px-12 py-10 flex gap-14` — imagen no toca los bordes del sidebar
- Sidebar izquierdo fijo `w-65 self-start sticky top-14.25`: imagen en contenedor cuadrado `aspect-square` con `object-contain`, marcas de esquina estilo galería, "Cambiar imagen" como overlay en hover
- Drop zone con marco editorial (marcas de esquina + `◇`), animación en drag
- Selector de tipo de obra: 4 tarjetas en grid con símbolo propio (`▭` pintura, `◇` escultura, `◎` fotografía, `∷` otro)
- Inputs underline sin fondo, tipografía serif en el título (`text-[28px]`)
- Botón central renombrado a "Guardar borrador" (antes "Borrador") para claridad
- Selector de galería con borde completo + `bg-bg rounded-xs` (estilo consistente con el resto del sistema)
- Integra upload a R2 + pipeline Sharp real

#### Formulario editar obra (`/dashboard/artworks/[id]/edit`)
- Mismo layout que nueva obra (sidebar imagen sticky + formulario)
- Imagen existente en contenedor cuadrado `object-contain`
- Hover sobre imagen muestra overlay con "Cambiar imagen" (gradiente oscuro + botón)

#### Galerías (`/dashboard/galleries`)
- Listado real con toggle público/privado, eliminar, badge de capacidad
- Slot "Nueva galería" contextual cuando quedan slots disponibles

#### Formulario nueva galería (`/dashboard/galleries/new`)
- **Panel izquierdo inmersivo**: vista perspectiva interior del espacio 3D (wireframe de un punto de fuga, paredes, obras y pedestal en SVG) — transmite que se está creando una sala física
- Selector de plantillas con mini-SVG de planta propio para cada opción (White Cube, Long Hall, Open Room)
- Marcas de esquina en el panel izquierdo al estilo galería
- Badge de contexto `◇ N posiciones · Plantilla` antes del formulario
- Inputs underline, visibilidad con símbolos `◎`/`◈` y hint contextual dinámico según opción activa
- ScrollReveal integrado (`app/dashboard/galleries/new/page.tsx`)

#### Home, Perfil, Plan
- **Home**: greeting real, stats row, galleries grid, activity feed (mock). **Banner de primeros pasos** (`components/dashboard/first-steps-banner.tsx`): visible cuando el artista no tiene galerías ni obras; se oculta en cuanto completa ambas acciones. QuickActions en layout `grid-cols-3` (sin card huérfana).
- **Perfil**: datos reales (nombre, bio, website, avatar), `PATCH /api/artists/me`, upload avatar a R2. Label de capacidad simplificado a "Obras expuestas". Sección redundante "Compartir perfil" eliminada (solo queda "URL pública").
- **Plan**: plan y uso reales, botones upgrade → Stripe Checkout, gestionar suscripción → Stripe Portal. Historial de facturas **real** vía `useQuery(['stripe-invoices'])` → `GET /api/stripe/invoices`. Estado vacío de facturas con icono y texto explicativo. Precio anual con texto secundario `facturado anualmente · Xε/año`. Botones CTA de plan con `rounded-xs`.

#### Topbar
- Avatar del artista (`artist.avatarUrl`) en el círculo superior derecho — mismo dato que el formulario de perfil; fallback `art-p1` si no hay foto configurada
- Avatar envuelto en `<Link href="/dashboard/profile">` — clickable al perfil del artista
- Sticky con backdrop-blur

#### Sidebar
- Badges y barra de progreso en vivo (TanStack Query)
- Sección plan con porcentaje de uso animado
- Cálculo de capacidad corregido: `usagePercent = (exposedCount / (limits.galleries * limits.artworksPerGallery)) * 100` — tiene en cuenta el total de slots disponibles según el plan, no solo los de una galería

### Frontend — Páginas públicas — datos reales
- `/obras`: catálogo con fetch real, filtros por tipo, búsqueda, thumbnails CDN. `TYPE_LABEL` de `lib/labels.ts`. Chip de galería de procedencia (`◇ Nombre galería`) en cada card. Select de ordenación con estilo unificado `border border-(--border) bg-bg rounded-xs`.
- `/galleries/[slug]`: obras expuestas reales, breadcrumb real. ArtistBar con segunda métrica "Miembro desde {año}" (dato `createdAt` del artista).
- `/galleries/[slug]/viewer`: manifest real cacheado desde BD, sala 3D completa. `ViewerMobileHint` superpuesto en móvil con "Arrastra · Pellizca para zoom", auto-oculto a los 4s. Scene controls con "✓ Guardado" al guardar configuración.
- `/artworks/[id]`: imágenes CDN reales, metadatos reales, incrementa `viewCount`. Descripción vacía omitida. Meta grid filtra celdas vacías. CTA "Contactar artista" oculto si no hay `gallerySlug` (en lugar de botón fantasma). Link del nombre del artista apunta a la galería pública. Sin "· Madrid" hardcodeado.

### Base de datos — Prisma + Neon
- Schema: `Artist`, `Gallery`, `GallerySlot`, `Artwork` + 7 enums
- Campo `Artwork.viewCount Int @default(0)` — contador de visitas públicas
- 2 migraciones aplicadas en Neon (PostgreSQL eu-west-2):
  - `20260604215508_init`
  - `20260619174122_add_artwork_view_count`

### Utilidades compartidas
- `lib/labels.ts` — `TYPE_LABEL: Record<ArtworkType, string>` único en el proyecto. Importado desde `artwork-overlay.tsx`, `artworks-list.tsx`, `obras-catalog.tsx`, `galleries/[slug]/page.tsx`, `artworks/[id]/page.tsx` y `landing/showcase-section.tsx`.
- `lib/hooks/use-focus-trap.ts` — hook `useFocusTrap(active)` que confina el foco de teclado al contenedor de un modal mientras está abierto. Usado en los modales de `artworks-list.tsx`.

### Backend — 16 Route Handlers + servicios + TanStack Query
- **Artista**: `GET/PATCH /api/artists/me`
- **Galerías**: `GET/POST /api/galleries`, `GET/PATCH/DELETE /api/galleries/[id]`, `GET /api/galleries/[id]/manifest`
- **Obras**: `GET/POST /api/artworks`, `GET/PATCH/DELETE /api/artworks/[id]`, `POST /api/artworks/[id]/publish`, `POST /api/artworks/[id]/unpublish`, `POST /api/artworks/[id]/trigger-processing`
- **Públicos**: `GET /api/artworks/public`, `GET /api/artworks/[id]/public`
- **Assets**: `POST /api/assets/presigned-url`
- **Inngest**: `GET/POST/PUT /api/inngest`
- **Stripe**: `POST /api/stripe/checkout`, `POST /api/stripe/portal`, `POST /api/webhooks/stripe`
- Validación Zod en todos los handlers privados
- Servicios: artist, gallery, artwork, manifest (`unstable_cache` + `revalidateTag`)
- TanStack Query: `useArtist`, `useGalleries`, `useArtworks` + todas las mutations
- `lib/api-helpers.ts`: `requireArtist()` + `serviceErrorToResponse()` con captura Sentry

### Bug fixes
- **Overlay de esculturas** (`components/viewer/artwork-overlay.tsx`): al hacer clic en una escultura en el viewer, el panel de detalle mostraba "Imagen en proceso" indefinidamente. Causa: el código comprobaba `'detail' in artwork.assets` para detectar `FlatAssets`, pero `ModelAssets` (esculturas) no tiene campo `detail`, solo `thumbnail`. La lógica ahora diferencia ambos tipos de assets y usa `ModelAssets.thumbnail` cuando corresponde.

### Pipeline de assets — R2 + Inngest + Sharp
- Upload directo a R2 con URL prefirmada desde el browser
- Inngest pipeline: descarga original → Sharp (thumbnail 400px / gallery 1200px / detail 2400px, webp) → sube a R2 → actualiza BD → invalida caché manifest

### Stripe billing
- Productos: Básico (gratis), Estándar (12€/mes), Premium (29€/mes)
- Webhook registrado: sincroniza `Artist.plan` en BD al recibir eventos `customer.subscription.*`
- `POST /api/stripe/checkout` — crea sesión, vincula `stripeCustomerId` al artista
- `POST /api/stripe/portal` — redirige al Stripe Customer Portal

### Sentry — observabilidad
- Init con DSN real (EU region, `ingest.de.sentry.io`) en client/server/edge configs
- `withSentryConfig` con tunnel `/monitoring`, source maps con `filesToDeleteAfterUpload`
- `app/global-error.tsx` — captura errores de React a nivel raíz
- `captureException` en todos los errores 500 inesperados de la capa de servicios

### Testing — Vitest
- **4 archivos, 33 tests, todos en verde**
- `__tests__/unit/services/artwork.service.test.ts` — `publishArtwork` (7 casos) + `unpublishArtwork` (3 casos)
- `__tests__/unit/services/gallery.service.test.ts` — `assertGalleryQuota` (6 casos × 3 planes) + `deleteGallery` (3 casos)
- `__tests__/unit/services/manifest.service.test.ts` — `buildManifest` (5 casos)
- `__tests__/integration/api/artworks.test.ts` — `POST /api/artworks` (4 casos) + `POST /api/artworks/[id]/publish` (4 casos)
- Prisma mockeado con `vi.hoisted()`, Clerk mockeado, `next/cache` mockeado

---

## 🔴 Pendiente / Mejoras conocidas

### Activity feed en home
- Actualmente mock. Requiere nueva tabla de eventos en el schema para ser real.

### Editar galería
- No existe pantalla de edición de galería (nombre, descripción, visibilidad). Actualmente el toggle visibilidad está en el listado, pero no hay formulario de edición completo.

### Tests E2E (opcional)
- Un único flujo crítico con Playwright: artista autentica → crea galería → sube obra → la expone → la ve en viewer → aparece en landing. Recomendado antes del primer deploy a producción.

---

## 📋 Decisiones de arquitectura cerradas

| Tema | Decisión |
|---|---|
| **Imágenes** | R2 + Sharp pipeline. URLs CDN en BD. ✅ |
| **Zustand viewer** | No se implementa. `useState` suficiente. |
| **Validación** | Zod en todos los handlers privados. ✅ |
| **Rate limiting** | Omitido para MVP. Protegido por Clerk. |
| **Caché manifest** | `unstable_cache` con tags + `revalidateTag`. ✅ |
| **Activity feed** | Mock hasta añadir tabla de eventos al schema. |
| **Obras destacadas landing** | Server Component, ordena por `viewCount desc`, estado vacío hasta que haya datos. ✅ |
| **Stripe local** | `npx stripe listen --forward-to localhost:3000/api/webhooks/stripe` en dev. |
| **Middleware → Proxy** | `proxy.ts` (Next.js 16). `middleware.ts` eliminado. ✅ |
| **Avatar artista** | `artist.avatarUrl` en BD (R2), no `user.imageUrl` de Clerk. Usado en topbar y perfil público. ✅ |
| **Layout formularios obra** | Sidebar imagen fijo (260px, `aspect-square`) + formulario a la derecha — no full-bleed. ✅ |
| **Formulario nueva galería** | Vista perspectiva interior 3D como preview — transmite la naturaleza espacial del producto. ✅ |
| **TYPE_LABEL** | Centralizado en `lib/labels.ts`. No duplicar en componentes. ✅ |
| **Focus trap modales** | `lib/hooks/use-focus-trap.ts` — confinamiento de foco en modales del dashboard. ✅ |
| **Viewer móvil** | `ViewerMobileHint` para instrucciones de gesto, auto-oculto a 4s. Solo en pantallas `< md`. ✅ |
| **Historial de facturas** | Real vía `GET /api/stripe/invoices`. `const INVOICES = [...]` mock eliminado de `plan-manager.tsx`. ✅ |
