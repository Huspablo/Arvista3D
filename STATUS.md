# Arvista 3D — Estado del proyecto

> Última revisión: 2026-04-27

---

## Terminado — Frontend completo (con mocks)

### Landing page (`/`)
- Hero section con imagen real, parallax y estadísticas animadas
- Ticker, manifesto, showcase con imágenes mock reales, features, artistas con fotos mock reales, CTA
- Nav, Footer, ScrollReveal

### Dashboard (`/dashboard/*`)
- Home: greeting, stats, gallerías grid, activity feed, quick actions
- Obras: listado con filtros por tipo y estado, buscador
- Galerías: gestor de galerías
- Formularios: nueva obra, nueva galería
- Perfil y plan: UI completa
- Toda la UI funciona con datos hardcodeados

### Galería pública (`/galleries/[slug]`)
- Hero de galería, masonry de obras, barra de artista
- Datos hardcodeados, imágenes con gradientes CSS `art-p*`

### Viewer 3D (`/galleries/[slug]/viewer`)
- Sala completa: paredes, suelo, techo, zócalos, cornisas, raíles de luz, marco de puerta
- Iluminación: ambiental, direccional, spots de techo, acentos por slot
- Slots de pared (`ArtworkWallSlot`) y pedestal de suelo (`FLOOR_MODEL`)
- Overlay de detalle al hacer clic en una obra
- Controles orbitales (arrastrar, zoom, límites de cámara)
- Funciona con manifest mock; las texturas de obras tienen URLs vacías

### Detalle de obra (`/artworks/[id]`)
- Zona de imagen con carrusel de miniaturas y zoom hover
- Panel de información con metadatos, técnica, edición y galería
- Datos hardcodeados, imágenes con gradientes CSS `art-p*`

### Infraestructura base
- `types/manifest.ts` — contrato completo del viewer definido y correcto
- `lib/db.ts` — singleton de Prisma configurado
- `lib/r2.ts` — cliente S3 para Cloudflare R2 configurado
- `lib/mock-data/landing.ts` — datos mock desacoplados para la landing
- `public/images/mock/` — imágenes mock de obras y artistas seleccionadas
- `.env.example` — todas las variables de entorno documentadas
- `package.json` — todas las dependencias instaladas (Clerk, Stripe, Inngest, Sharp, Sentry, TanStack Query, Zustand, R3F, Drei)

---

## Pendiente — Crítico (el proyecto no funciona sin esto)

### 1. Prisma schema — vacío
`prisma/schema.prisma` solo tiene el datasource. No hay ningún modelo definido.
Faltan: `Artist`, `Gallery`, `Artwork`, `Slot`, `Subscription`, y sus relaciones.
Sin schema no hay base de datos, no hay tipos y no se puede construir ningún backend.

### 2. Sin ningún Route Handler
No existe ningún endpoint real en el proyecto. Toda la API está por construir:
- `GET /api/galleries/[slug]/manifest` — el viewer depende de esto
- CRUD de galerías y obras del artista
- Subida de assets con URL prefirmada a R2
- Webhook de Stripe para sincronizar estado de suscripción
- Endpoint de Inngest para jobs asíncronos

### 3. Sin middleware de Clerk
No existe `middleware.ts`. El dashboard no tiene protección de ruta.
Cualquier usuario sin autenticar puede acceder a `/dashboard`.

### 4. `ObrasCatalog` no existe
`app/obras/page.tsx` importa `@/components/public/obras-catalog` — ese archivo no existe.
La página `/obras` está rota y no compilaría en producción.

### 5. Viewer sin texturas reales
Las obras en el manifest mock tienen `assets: { gallery: '' }`.
Las paredes de la galería 3D no muestran imágenes; solo el marco y el fondo.

---

## Pendiente — Importante (calidad y completitud)

- **Inngest + Sharp**: pipeline de procesamiento de assets — sin esto las subidas no generan los derivados (thumbnail, gallery, detail) que el viewer necesita
- **Stripe**: billing y webhooks — la página de plan no hace nada real; los límites por plan no se validan
- **TanStack Query**: instalado pero no se usa en ningún componente; todo el fetching está pendiente
- **Zustand**: instalado pero el viewer gestiona estado con `useState` local; falta el store del viewer
- **Imágenes mock en páginas internas**: galería pública, lista de obras del dashboard y detalle de obra siguen usando gradientes CSS `art-p*`
- **Sentry**: instalado como dependencia pero sin configurar

---

## Próximos pasos — En orden

### Paso 1 — Prisma schema
Definir todos los modelos del dominio con sus relaciones, enumeraciones y restricciones.
Modelos necesarios: `Artist`, `Gallery`, `Artwork`, `GallerySlot`, `Subscription`.
Sin esto no se puede avanzar en nada del backend.

### Paso 2 — Clerk middleware
Crear `middleware.ts` en la raíz del proyecto.
Proteger todas las rutas bajo `/dashboard` y los Route Handlers privados.
Enlazar la identidad de Clerk con el modelo `Artist` en primera visita.

### Paso 3 — Route Handlers del dominio
Implementar los endpoints CRUD respetando las reglas de negocio de `BUSINESS_RULES.md`:
- Galerías: crear, listar, editar, eliminar (validando límites de plan)
- Obras: crear, listar, editar, eliminar
- Publicación: asignar obra a slot de galería (validando capacidad y compatibilidad)
- Retirada: liberar slot y dejar obra en estado sin exponer

### Paso 4 — Manifest API + conectar viewer
Implementar `GET /api/galleries/[slug]/manifest`.
El viewer ya está construido; solo necesita datos reales.
En cuanto el endpoint devuelva assets reales, la galería 3D cobra vida completa.

### Paso 5 — Pipeline de assets (R2 + Inngest + Sharp)
Implementar subida directa a R2 con URL prefirmada.
Crear función Inngest que al recibir el evento de subida:
1. Descarga el original desde R2
2. Genera derivados con Sharp (thumbnail, gallery, detail)
3. Sube los derivados a R2
4. Actualiza los campos de asset en base de datos

### Paso 6 — Conectar frontend con TanStack Query
Sustituir todos los datos hardcodeados por fetching real.
Un único paso de conexión por pantalla: dashboard, galería pública, detalle de obra.
Añadir store de Zustand para el estado del viewer (slot seleccionado, modo, cámara).

### Paso 7 — ObrasCatalog + imágenes mock en páginas internas
Crear el componente `ObrasCatalog` para la página `/obras` (catálogo público de obras).
Aplicar imágenes mock reales en galería pública, listado del dashboard y detalle de obra,
igual que se hizo en la landing. Deuda técnica menor, pero necesaria antes de producción.

### Paso 8 — Stripe billing
Integrar Stripe Billing: productos, precios y webhook.
El webhook sincroniza el plan activo con el campo `plan` del modelo `Artist`.
Los límites de plan ya estarán validados en el backend desde el Paso 3;
Stripe solo añade el cobro real encima de esa lógica.
