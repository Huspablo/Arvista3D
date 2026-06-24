# Arvista 3D — Guía completa para redacción del TFG

> **Destinatario**: este documento está diseñado para ser leído por una IA que ayuda a revisar y completar el documento TFG_Arvista3D_Multimedia.docx. Contiene todos los detalles técnicos, decisiones de diseño, fragmentos de código reales del repositorio, el razonamiento detrás de cada elección y las limitaciones conocidas. Está organizado siguiendo la estructura habitual de un Trabajo de Fin de Grado de ingeniería informática.
>
> **Cómo usarlo**: cada sección de este documento corresponde aproximadamente a un capítulo del TFG. Los fragmentos de código están extraídos del repositorio real. Las correcciones explícitas al documento original se señalan como **[CORRECCIÓN]**. Los apartados nuevos que no existen en el TFG se señalan como **[AÑADIR]**.

---

## 1. Descripción general del proyecto

**Arvista 3D** es una plataforma web para la creación y exposición de galerías de arte virtuales en tres dimensiones. Permite a los artistas gestionar su catálogo de obras desde un panel de control privado, publicarlas en galerías configurables y compartirlas con visitantes que pueden recorrerlas en un entorno 3D directamente en el navegador, sin necesidad de instalar ningún software adicional.

El proyecto surge de la necesidad de democratizar el acceso a la exposición artística digital. Las plataformas actuales ofrecen catálogos planos y bidimensionales (ArtStation, Behance, Saatchi Art) o galerías 3D cerradas que no permiten gestión propia del contenido. Arvista 3D propone una experiencia inmersiva que simula el recorrido por una galería física real, con control de iluminación, materiales de sala y disposición de las obras, accesible directamente desde un navegador web moderno.

### Objetivos principales

1. Construir una plataforma full-stack moderna con Next.js que integre frontend, backend y viewer 3D en un único proyecto cohesionado.
2. Implementar un sistema de autenticación, roles y planes de suscripción completo, con facturación recurrente real via Stripe.
3. Diseñar un pipeline robusto de procesamiento de assets: subida al servidor, optimización con Sharp y distribución global vía CDN.
4. Crear un viewer 3D en el navegador con React Three Fiber capaz de renderizar obras en sala a partir de un manifest semántico generado por el backend.
5. Aplicar principios de diseño de dominio: reglas de negocio explícitas, separación de capas y validación exhaustiva en cada entrada al sistema.

---

## 2. Contexto tecnológico y estado del arte

### 2.1 Renderización 3D en el navegador

La renderización 3D en navegadores web ha madurado significativamente con la adopción universal de **WebGL 2.0** como estándar soportado por todos los navegadores modernos (Chrome, Firefox, Safari, Edge). WebGL expone la API gráfica del dispositivo directamente al JavaScript del navegador, eliminando la necesidad de plugins como Flash o Unity Web Player.

Sobre WebGL se construye el ecosistema actual:

- **Three.js**: la biblioteca JavaScript más consolidada sobre WebGL, con más de 90.000 estrellas en GitHub y uso documentado en aplicaciones de entretenimiento, educación y diseño. Gestiona escenas, cámaras, luces, geometrías y materiales con una API declarativa.
- **React Three Fiber (R3F)**: capa declarativa para integrar Three.js dentro del ciclo de vida de React. Permite describir escenas 3D como árboles de componentes con estado reactivo, aprovechar el ecosistema de hooks de React y compartir estado entre la UI 2D y la escena 3D.
- **Drei**: colección de utilidades y abstracciones de alto nivel para R3F: `useTexture`, `useGLTF`, `OrbitControls`, loaders progresivos, y helpers de escena.

**WebXR** es la evolución natural de WebGL para experiencias de realidad aumentada y virtual. Arvista 3D no adopta WebXR en esta versión por dos razones: la penetración de dispositivos XR entre el público objetivo de galerías de arte es marginal, y WebXR añadiría una capa de complejidad en el diseño de interacción incompatible con el objetivo de accesibilidad universal desde cualquier navegador de escritorio o móvil.

Alternativas consideradas y descartadas:

| Tecnología | Motivo del descarte |
|---|---|
| Babylon.js | Motor más completo pero con curva de aprendizaje mayor y menor integración con React |
| A-Frame | Orientado a realidad virtual, excesivamente opinionado para una galería de arte |
| Pixel Streaming (Unreal Engine) | Calidad visual máxima pero requiere servidores GPU dedicados, inviable económicamente para un MVP |
| Unity WebGL | Build pesado, integración con React compleja, rendimiento inferior a Three.js nativo |

### 2.2 Plataformas de galería virtual existentes

**[CORRECCIÓN]** La tabla del TFG debe ampliarse de 4 a al menos 6–8 plataformas. La versión actual omite opciones directamente comparables:

| Plataforma | Tecnología base | Modelo de negocio | Limitación principal |
|---|---|---|---|
| Kunstmatrix | WebGL propietario | SaaS cerrado, planes mensuales | Sin personalización, sin API pública |
| Artsteps | Three.js | Freemium | Editor complejo, sin pipeline de assets propio |
| Matterport | Foto 360° + WebGL | SaaS, pago por escaneo | Solo espacios físicos escaneados, no arte digital |
| OpenSea (3D) | WebGL básico | Comisión por transacción | Solo NFTs, sin galería propia persistente |
| Mozilla Hubs | WebXR / A-Frame | Open source | Interfaz genérica, no especializada en arte |
| Spatial.io | WebXR + WebGL | Freemium | Enfocado en metaverso social, no curaduría |
| Sketchfab | Three.js | SaaS, modelo de obra individual | Sin salas de exposición, sin gestión de artista |
| Saatchi Art | HTML/CSS plano | Comisión por venta | Catálogo 2D, sin experiencia 3D |

Ninguna plataforma existente combina: (a) experiencia 3D de calidad nativa en navegador, (b) gestión propia del catálogo por el artista, (c) pipeline de assets automatizado y (d) modelo de suscripción con límites por plan. Arvista 3D ocupa este espacio.

**Contexto académico**: la idea de museos y galerías virtuales tiene raíces en proyectos de los años 2000 como el Virtual Museum Project (Griffiths, 2003) y los estudios sobre *presence* en entornos virtuales (Slater & Wilbur, 1997). La diferencia con esos trabajos es la eliminación del plugin obligatorio: WebGL permite acceso universal sin instalación.

---

## 3. Arquitectura del sistema

### 3.1 Visión general

El proyecto adopta una arquitectura **monolítica modular** con Next.js 16 como núcleo. Esta decisión se toma deliberadamente frente a microservicios: para un MVP, la simplicidad operativa y la coherencia de tipos entre frontend y backend superan las ventajas teóricas de la distribución. Un único repositorio, un único deploy, sin latencia de red entre capas internas.

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENTE (Browser)                        │
│  Landing / Catálogo    Dashboard (React)    Viewer 3D (R3F)  │
└─────────────┬───────────────────┬───────────────────┬───────┘
              │ Server Components  │ TanStack Query    │ Manifest
              ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│                  Next.js 16 (App Router)                     │
│  Server Components    Route Handlers    unstable_cache       │
└──────────┬────────────────────┬────────────────────┬────────┘
           │                    │                    │
    ┌──────▼──────┐    ┌────────▼───────┐   ┌──────▼──────┐
    │  Servicios  │    │   Validación   │   │   Caché     │
    │  de dominio │    │     Zod        │   │  por tags   │
    └──────┬──────┘    └────────────────┘   └─────────────┘
           │
    ┌──────▼──────────────────────────────────────────────┐
    │                  Prisma ORM                          │
    └──────┬──────────────────────────────────────────────┘
           │
    ┌──────▼──────┐    ┌──────────────┐    ┌────────────┐
    │ Neon (PSQL) │    │ Cloudflare   │    │   Clerk    │
    │   Datos     │    │  R2 + CDN    │    │    Auth    │
    └─────────────┘    │   Assets     │    └────────────┘
                       └──────┬───────┘
                              │ Inngest job
                       ┌──────▼───────┐
                       │    Sharp     │
                       │ 3 variantes  │
                       └─────────────┘
```

### 3.2 Separación de capas

| Capa | Ubicación | Responsabilidad |
|---|---|---|
| **Presentación** | `app/`, `components/` | Render, formularios, viewer |
| **API** | `app/api/*/route.ts` | HTTP, validación Zod, auth |
| **Dominio** | `lib/services/*.service.ts` | Reglas de negocio, transacciones |
| **Infraestructura** | `lib/db.ts`, `lib/r2.ts`, `lib/stripe.ts` | Clientes externos |
| **Contratos** | `lib/schemas/`, `types/` | Tipos compartidos, validación |

Esta separación garantiza que las reglas de negocio (publicar una obra, gestionar cuotas de plan) sean testeables de forma aislada sin depender de la capa HTTP ni de la base de datos real.

---

## 4. Modelo de dominio

### 4.1 Entidades principales

El dominio se organiza en torno a tres entidades y una regla de jerarquía clara:

**Artista → Galerías → Obras**

Un artista es el propietario de todo el contenido. Tiene un plan de suscripción que limita cuántas galerías puede crear y cuántas obras puede exponer por galería. Una galería tiene posiciones físicas (slots) con un modo de representación determinado por la plantilla. Una obra ocupa exactamente un slot cuando está expuesta.

### 4.2 Esquema de base de datos

**[CORRECCIÓN]** El listado en el TFG omite campos sin indicarlo con claridad. Los campos ausentes son: `avatarUrl`, `website`, `bio` en `Artist`; `year`, `technique`, `description`, `tags`, `edition`, `dimWidth`, `dimHeight`, `dimDepth`, `viewCount` en `Artwork`. El listado a continuación reproduce los campos más relevantes para expresar las reglas de negocio; en el TFG debe añadirse una nota explícita indicando qué campos se han omitido y por qué.

```prisma
model Artist {
  id        String @id @default(cuid())
  clerkId   String @unique  // ID de usuario en Clerk (user_xxxx)
  name      String @default("")
  bio       String @default("")
  website   String?
  avatarUrl String?         // URL CDN del avatar (subido a R2, no Clerk)
  plan      Plan   @default(BASIC)

  stripeCustomerId     String? @unique
  stripeSubscriptionId String? @unique

  galleries Gallery[]
  artworks  Artwork[]
}

model Gallery {
  id          String     @id @default(cuid())
  slug        String     @unique
  name        String
  description String     @default("")
  visibility  Visibility @default(PRIVATE)
  templateKey String     @default("white-cube-8")

  // Configuración visual persistida (visible en viewer)
  wallColor      String?
  floorMaterial  FloorMaterial  @default(CONCRETE)
  lightingPreset LightingPreset @default(WARM)

  artistId String
  artist   Artist @relation(fields: [artistId], references: [id], onDelete: Cascade)
  slots    GallerySlot[]
}

model GallerySlot {
  id          String      @id @default(cuid())
  position    Int
  displayMode DisplayMode  // WALL_PLANE o FLOOR_MODEL

  galleryId String
  gallery   Gallery @relation(fields: [galleryId], references: [id], onDelete: Cascade)

  artworkId String?  @unique   // @unique → una obra en exactamente un slot
  artwork   Artwork? @relation(fields: [artworkId], references: [id], onDelete: SetNull)

  @@unique([galleryId, position])
}

model Artwork {
  id          String        @id @default(cuid())
  title       String
  type        ArtworkType
  status      ArtworkStatus @default(DRAFT)
  viewCount   Int           @default(0)  // incrementado en cada visita pública

  // Assets generados por el pipeline Sharp
  assetOriginalKey String?
  assetThumbnail   String?   // URL CDN — 400×400 px webp (listas y overlay)
  assetGallery     String?   // URL CDN — 1200×900 px webp (textura en sala 3D)
  assetDetail      String?   // URL CDN — 2400×1800 px webp (panel de detalle)
  assetModel       String?   // clave R2 — .glb (esculturas, FLOOR_MODEL)

  // Metadatos curatoriales
  year        Int?
  tags        String[]
  dimWidth    Float?
  dimHeight   Float?
  dimDepth    Float?

  artistId String
  artist   Artist @relation(fields: [artistId], references: [id], onDelete: Cascade)
  slot     GallerySlot?
}

enum Plan           { BASIC STANDARD PREMIUM }
enum Visibility     { PUBLIC PRIVATE }
enum ArtworkType    { PAINTING SCULPTURE PHOTOGRAPHY OTHER }
enum ArtworkStatus  { DRAFT EXPOSED }
enum DisplayMode    { WALL_PLANE FLOOR_MODEL }
enum FloorMaterial  { CONCRETE PARQUET MARBLE }
enum LightingPreset { WARM NEUTRAL DRAMATIC }
```

### 4.3 Decisiones de diseño del esquema

**`@unique` en `GallerySlot.artworkId`**: garantiza en base de datos que una obra no puede estar en dos slots simultáneamente. Es una restricción de integridad, no solo de lógica de aplicación. Si la transacción de publicación tiene una race condition, PostgreSQL rechaza la operación con violación de unique constraint antes de llegar a un estado inconsistente.

**`onDelete: SetNull` en Artwork→Slot**: al eliminar una obra, su slot queda libre automáticamente. Al eliminar una galería (`Cascade`), sus slots desaparecen y las obras quedan con `slot = null` y `status = DRAFT`.

**`viewCount`**: campo de seguimiento de popularidad. Se incrementa en el servidor cada vez que un visitante accede al endpoint público `GET /api/artworks/[id]/public`. **[AÑADIR AL TFG]** Este dato tiene una consecuencia directa en la experiencia pública: la landing page es un Server Component que consulta la base de datos ordenando por `viewCount desc`, límite 6, para mostrar las obras más visitadas. Es el único punto del sistema donde el comportamiento del visitante (las visitas a obras) retroalimenta directamente lo que ven otros visitantes (la sección de obras destacadas).

**Campos de asset separados**: en lugar de un array JSON, cada derivado tiene su propio campo tipado. Esto permite hacer `SELECT` eficiente solo de los campos necesarios (por ejemplo, el manifest carga `assetGallery` y `assetThumbnail` sin cargar `assetDetail`) y mantiene el esquema explícito y validable.

---

## 5. Reglas de negocio

### 5.1 Límites de plan

**[CORRECCIÓN]** El documento TFG presenta la tabla de límites sin incluir los precios. Un lector no puede entender el modelo de negocio sin esa información. La tabla completa es:

| Plan | Precio | Galerías | Obras/galería |
|---|---|---|---|
| Básico | Gratuito | 1 | 10 |
| Estándar | 12 €/mes | 2 | 20 |
| Premium | 29 €/mes | 3 | 50 |

La fuente de verdad de los límites es un único objeto en `lib/services/artist.service.ts`:

```typescript
export const PLAN_LIMITS = {
  BASIC:    { galleries: 1, artworksPerGallery: 10 },
  STANDARD: { galleries: 2, artworksPerGallery: 20 },
  PREMIUM:  { galleries: 3, artworksPerGallery: 50 },
} as const
```

Todos los servicios importan este objeto. Si los límites cambian, el cambio se propaga automáticamente a toda la aplicación sin buscar constantes dispersas.

### 5.2 Publicación de obras — las cuatro condiciones

La función `publishArtwork` en `lib/services/artwork.service.ts` implementa la regla más crítica del sistema. Valida cuatro condiciones en secuencia antes de ejecutar la transacción atómica:

```typescript
export async function publishArtwork(
  artworkId: string,
  galleryId: string,
  artistId:  string,
  plan:      keyof typeof PLAN_LIMITS,
): Promise<Artwork> {

  // 1. La obra pertenece al artista que realiza la acción
  const artwork = await db.artwork.findFirst({ where: { id: artworkId, artistId } })
  if (!artwork) throw new Error('FORBIDDEN: obra no encontrada o sin permisos')

  // 2. La galería pertenece al mismo artista
  const gallery = await db.gallery.findFirst({
    where:   { id: galleryId, artistId },
    include: { slots: { include: { artwork: true } } },
  })
  if (!gallery) throw new Error('FORBIDDEN: galería no encontrada o sin permisos')

  // 3. La galería no ha alcanzado el límite de obras del plan
  const exposedCount = gallery.slots.filter(s => s.artworkId !== null).length
  if (exposedCount >= PLAN_LIMITS[plan].artworksPerGallery) {
    throw new Error(`CAPACITY_REACHED: límite de ${PLAN_LIMITS[plan].artworksPerGallery} obras`)
  }

  // 4. Existe un slot compatible y libre
  // Esculturas → FLOOR_MODEL; pinturas y fotografías → WALL_PLANE
  const neededMode = artwork.type === 'SCULPTURE' ? 'FLOOR_MODEL' : 'WALL_PLANE'
  const freeSlot   = gallery.slots.find(
    s => s.displayMode === neededMode && s.artworkId === null
  )
  if (!freeSlot) {
    throw new Error(`NO_SLOT: no hay posición ${neededMode} libre`)
  }

  // Transacción atómica: actualizar estado de obra y asignar slot
  const [updatedArtwork] = await db.$transaction([
    db.artwork.update({ where: { id: artworkId }, data: { status: 'EXPOSED' } }),
    db.gallerySlot.update({ where: { id: freeSlot.id }, data: { artworkId } }),
  ])

  revalidateTag(`manifest-${galleryId}`, {})
  return updatedArtwork
}
```

El prefijo del mensaje de error (`FORBIDDEN`, `CAPACITY_REACHED`, `NO_SLOT`) es interpretado por `serviceErrorToResponse()` en `lib/api-helpers.ts` para devolver el código HTTP apropiado sin lógica de mapeo duplicada:

```typescript
export function serviceErrorToResponse(err: unknown): NextResponse {
  const msg = err instanceof Error ? err.message : ''
  if (msg.startsWith('FORBIDDEN'))        return NextResponse.json({ error: msg }, { status: 403 })
  if (msg.startsWith('GALLERY_LIMIT'))    return NextResponse.json({ error: msg }, { status: 403 })
  if (msg.startsWith('CAPACITY_REACHED')) return NextResponse.json({ error: msg }, { status: 403 })
  if (msg.startsWith('NO_SLOT'))          return NextResponse.json({ error: msg }, { status: 409 })
  if (msg.startsWith('INVALID_STATE'))    return NextResponse.json({ error: msg }, { status: 409 })
  if (msg.startsWith('GALLERY_NOT_FOUND'))return NextResponse.json({ error: msg }, { status: 404 })
  Sentry.captureException(err)           // error inesperado → Sentry
  return NextResponse.json({ error: 'Internal error' }, { status: 500 })
}
```

### 5.3 Cuota de galerías

```typescript
export async function assertGalleryQuota(artistId: string, plan: keyof typeof PLAN_LIMITS) {
  const count = await db.gallery.count({ where: { artistId } })
  if (count >= PLAN_LIMITS[plan].galleries) {
    throw new Error(`GALLERY_LIMIT: máximo ${PLAN_LIMITS[plan].galleries} galería(s)`)
  }
}
```

Esta función se llama siempre antes de `createGallery`, garantizando que el límite se respeta incluso si la UI no lo valida en el cliente.

### 5.4 Retirar una obra

Cuando el artista retira una obra de la galería, `unpublishArtwork` realiza la operación inversa:

```typescript
export async function unpublishArtwork(artworkId: string, artistId: string): Promise<Artwork> {
  const artwork = await db.artwork.findFirst({
    where: { id: artworkId, artistId },
    include: { slot: { select: { galleryId: true, id: true } } },
  })
  if (!artwork) throw new Error('FORBIDDEN: obra no encontrada o sin permisos')
  if (artwork.status !== 'EXPOSED') throw new Error('INVALID_STATE: la obra no está expuesta')

  const [updatedArtwork] = await db.$transaction([
    db.artwork.update({ where: { id: artworkId }, data: { status: 'DRAFT' } }),
    db.gallerySlot.update({ where: { id: artwork.slot!.id }, data: { artworkId: null } }),
  ])

  revalidateTag(`manifest-${artwork.slot!.galleryId}`, {})
  return updatedArtwork
}
```

Al retirar la obra, el slot queda libre para otra obra del mismo tipo.

---

## 6. API — Route Handlers

### 6.1 Patrón uniforme

Todos los Route Handlers privados siguen el mismo patrón de tres fases:

```typescript
// Ejemplo: POST /api/galleries
export async function POST(req: Request) {
  // Fase 1: autenticación y resolución del artista
  const { artist, error } = await requireArtist()
  if (error) return error   // → 401 si no hay sesión

  try {
    // Fase 2: validación de la entrada con Zod
    const body   = await req.json()
    const parsed = CreateGallerySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    // Fase 3: delegación al servicio de dominio
    const gallery = await createGallery(artist.id, artist.plan, parsed.data)
    return NextResponse.json(gallery, { status: 201 })

  } catch (err) {
    return serviceErrorToResponse(err)  // → 403/404/409/500 según el prefijo del error
  }
}
```

Este patrón garantiza que los handlers son delgados (no contienen lógica de negocio), la validación ocurre siempre antes de llegar al dominio, y los errores se traducen a HTTP de forma consistente en un único punto.

### 6.2 Helper `requireArtist`

```typescript
// lib/api-helpers.ts
export async function requireArtist() {
  const { userId } = await auth()    // Clerk
  if (!userId) {
    return { artist: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  const artist = await getOrCreateArtist(userId)   // crea el registro si es el primer login
  return { artist, error: null }
}
```

La función `getOrCreateArtist` implementa el patrón **upsert**: en el primer acceso de un usuario, crea automáticamente el registro `Artist` en base de datos vinculado a su `clerkId`. Esto elimina la necesidad de un endpoint de "registro de artista" separado; el artista existe en la BD desde la primera petición autenticada.

### 6.3 Lista completa de endpoints

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/api/artists/me` | Perfil del artista autenticado | ✓ |
| PATCH | `/api/artists/me` | Actualizar nombre, bio, web | ✓ |
| GET | `/api/galleries` | Listar galerías propias | ✓ |
| POST | `/api/galleries` | Crear galería | ✓ |
| GET | `/api/galleries/[id]` | Obtener galería | ✓ |
| PATCH | `/api/galleries/[id]` | Actualizar galería (nombre, visibilidad, config visual) | ✓ |
| DELETE | `/api/galleries/[id]` | Eliminar galería + poner obras en DRAFT | ✓ |
| GET | `/api/galleries/[id]/manifest` | Manifest para el viewer | Público si PUBLIC |
| GET | `/api/artworks` | Listar obras propias | ✓ |
| POST | `/api/artworks` | Crear obra | ✓ |
| GET | `/api/artworks/[id]` | Obtener obra | ✓ |
| PATCH | `/api/artworks/[id]` | Actualizar obra | ✓ |
| DELETE | `/api/artworks/[id]` | Eliminar obra | ✓ |
| POST | `/api/artworks/[id]/publish` | Exponer obra en galería | ✓ |
| POST | `/api/artworks/[id]/unpublish` | Retirar obra | ✓ |
| POST | `/api/artworks/[id]/trigger-processing` | Iniciar pipeline Inngest manualmente | ✓ |
| GET | `/api/artworks/public` | Catálogo público con filtros | Público |
| GET | `/api/artworks/[id]/public` | Detalle público + incrementa `viewCount` | Público |
| GET | `/api/galleries/public` | Catálogo público de galerías con búsqueda, orden y previews de obras | Público |
| GET | `/api/artists/public` | Catálogo público de artistas con búsqueda, conteo de obras y galería principal | Público |
| POST | `/api/assets/artwork-upload` | Subir imagen de obra (multipart, via servidor) | ✓ |
| POST | `/api/assets/avatar-upload` | Subir avatar de artista (multipart, via servidor) | ✓ |
| POST | `/api/assets/presigned-url` | URL prefirmada para subida directa a R2 | ✓ |
| GET/POST/PUT | `/api/inngest` | Endpoint de Inngest (jobs asíncronos) | Interno |
| POST | `/api/stripe/checkout` | Crear sesión de pago Stripe | ✓ |
| POST | `/api/stripe/portal` | Portal de gestión de suscripción | ✓ |
| GET | `/api/stripe/invoices` | Listar facturas pasadas del artista | ✓ |
| POST | `/api/webhooks/stripe` | Sincronizar plan tras pago (HMAC verificado) | Stripe |

---

## 7. Pipeline de procesamiento de assets

### 7.1 Flujo de subida

**[CORRECCIÓN]** El diagrama del TFG muestra un flujo de URL prefirmada donde el browser sube directamente a R2. La implementación actual difiere: el servidor Next.js actúa como intermediario para la subida de imágenes de obras, evitando el error CORS que produce el `PUT` directo desde el navegador a R2 con firma S3. El endpoint `presigned-url` existe en el repositorio pero no es el que usa el dashboard actual.

El flujo real de subida de imágenes de obra es el siguiente:

```
Browser                Next.js (POST /api/assets/artwork-upload)        R2
   │                                    │                                │
   │  multipart/form-data (file + id)   │                                │
   │───────────────────────────────────>│                                │
   │                                    │  PutObjectCommand(original)    │
   │                                    │───────────────────────────────>│
   │                                    │  Sharp → thumbnail.webp (400px)│
   │                                    │  Sharp → gallery.webp (1200px) │
   │                                    │  PutObjectCommand ×2           │
   │                                    │───────────────────────────────>│
   │                                    │  db.artwork.update(urls)       │
   │                                    │  inngest.send('artwork/upload')│
   │  { thumbnailUrl, galleryUrl, ok }  │                                │
   │<───────────────────────────────────│                                │
```

En el mismo request síncrono se generan dos variantes WebP con Sharp: la miniatura de 400 px para el dashboard y la variante de galería de 1200 px para la textura 3D. Esto garantiza que la galería 3D muestre la imagen inmediatamente después de la subida, sin depender de que el servidor Inngest esté activo.

A continuación, el servidor dispara el evento `artwork/uploaded` hacia Inngest para que el pipeline asíncrono genere la variante `detail` (2400 px) y sobrescriba las variantes existentes con versiones potencialmente más optimizadas.

### 7.2 Función de Inngest (pipeline completo)

**[CORRECCIÓN]** El documento TFG indica que la función consta de cuatro pasos. El código real implementa **tres** `step.run()`. La invalidación del manifest no es un paso propio del pipeline de Inngest sino parte de `publishArtwork()` en el servicio de obras.

Inngest divide el procesamiento en pasos reanudables. Si un paso falla, se reintenta desde ese punto sin repetir los anteriores:

```typescript
export const processArtworkUpload = inngest.createFunction(
  {
    id:       'process-artwork-upload',
    name:     'Procesar imagen subida',
    triggers: [{ event: 'artwork/uploaded' }],
  },
  async ({ event, step }) => {
    const { artworkId, originalKey } = event.data

    // Paso 1: descarga el original de R2
    const buffer = await step.run('download-original', async () => {
      const res = await r2.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: originalKey }))
      const chunks: Uint8Array[] = []
      for await (const chunk of res.Body as AsyncIterable<Uint8Array>) chunks.push(chunk)
      return Buffer.concat(chunks)
    })

    // Paso 2: genera las 3 variantes webp y las sube a R2
    const assetKeys = await step.run('generate-and-upload-variants', async () => {
      const VARIANTS = [
        { suffix: 'thumbnail', width: 400,  height: 400,  fit: 'cover'  as const },
        { suffix: 'gallery',   width: 1200, height: 900,  fit: 'inside' as const },
        { suffix: 'detail',    width: 2400, height: 1800, fit: 'inside' as const },
      ]
      const results: Record<string, string> = {}
      for (const v of VARIANTS) {
        const webp = await sharp(buffer)
          .resize(v.width, v.height, { fit: v.fit, withoutEnlargement: true })
          .webp({ quality: 85 })
          .toBuffer()
        const key = `artworks/${artworkId}/${v.suffix}.webp`
        await r2.send(new PutObjectCommand({
          Bucket: R2_BUCKET, Key: key, Body: webp,
          ContentType: 'image/webp',
          CacheControl: 'public, max-age=31536000, immutable',
        }))
        results[v.suffix] = key
      }
      return results
    })

    // Paso 3: actualiza la BD con las URLs de CDN
    await step.run('update-artwork-assets', async () => {
      await db.artwork.update({
        where: { id: artworkId },
        data: {
          assetThumbnail: cdnUrl(assetKeys.thumbnail),
          assetGallery:   cdnUrl(assetKeys.gallery),
          assetDetail:    cdnUrl(assetKeys.detail),
        },
      })
    })
  }
)
```

La cabecera `Cache-Control: public, max-age=31536000, immutable` instruye a la CDN de Cloudflare para cachear los assets durante un año. Como la clave incluye el ID de la obra (por ejemplo `artworks/cma3x.../gallery.webp`), es seguro usar caché larga: la URL no cambia si la imagen cambia, pero como la clave usa el ID de la obra y la obra se elimina y recrea, en la práctica no hay colisión.

---

## 8. Gallery Manifest — contrato backend/viewer

### 8.1 Concepto

El manifest es el objeto JSON que el backend entrega al viewer. Contiene todo lo que el viewer necesita para renderizar la escena: configuración de la sala, posiciones de los slots y assets de cada obra. El viewer **no consulta la base de datos directamente ni infiere nada** desde los tipos de obra — todo viene del manifest, incluyendo el `displayMode` de cada slot.

```typescript
// types/manifest.ts
type GalleryManifest = {
  gallery: {
    id:          string
    name:        string
    templateKey: string       // "white-cube-8"
    config: {
      wallColor?:      string  // hex, persistido en DB
      floorMaterial:   'concrete' | 'parquet' | 'marble'
      lightingPreset:  'warm' | 'neutral' | 'dramatic'
    }
  }
  slots: Array<{
    id:          string
    position:    number        // 0-7 en white-cube-8
    displayMode: 'WALL_PLANE' | 'FLOOR_MODEL'
    artwork: {
      id:         string
      title:      string
      artistName: string
      type:       'PAINTING' | 'SCULPTURE' | 'PHOTOGRAPHY' | 'OTHER'
      year?:      number
      tags:       string[]
      dimensions?: { width: number; height: number; depth?: number }
      assets:     FlatAssets | ModelAssets
    } | null   // null = slot vacío
  }>
}

// WALL_PLANE (pinturas, fotografías):
type FlatAssets  = { thumbnail: string; gallery: string; detail: string }

// FLOOR_MODEL (esculturas):
type ModelAssets = { model: string; thumbnail: string }
```

### 8.2 Generación y caché

```typescript
// lib/services/manifest.service.ts
export function buildManifest(galleryId: string): Promise<GalleryManifest> {
  return unstable_cache(
    () => _buildManifest(galleryId),     // función que consulta Prisma
    [galleryId],                          // clave de caché
    { tags: [`manifest-${galleryId}`] }, // etiqueta para invalidación selectiva
  )()
}
```

`unstable_cache` de Next.js mantiene el manifest en memoria del servidor entre requests. Cuando el artista publica o retira una obra, o modifica la configuración de la galería, el sistema llama a `revalidateTag(`manifest-${galleryId}`, {})`. Nota: en Next.js 16, `revalidateTag` requiere dos argumentos obligatoriamente (la etiqueta y un objeto de opciones vacío `{}`); omitir el segundo argumento provoca un error en tiempo de ejecución.

### 8.3 Plantilla white-cube-8

La sala 3D tiene dimensiones aproximadas de 10×3.2×10 metros. La plantilla `white-cube-8` define 8 posiciones fijas:

- Posiciones 0–6: slots de pared (WALL_PLANE) — para pinturas y fotografías.
- Posición 7: slot de suelo (FLOOR_MODEL) — pedestal central para esculturas.

Las posiciones están codificadas en `gallery-scene.tsx` como una estructura estática con coordenadas de posición 3D, rotación y tamaño máximo de cada slot. El viewer no calcula posiciones: las lee del manifest combinadas con la tabla de posiciones de la plantilla.

---

## 9. Autenticación y autorización

### 9.1 Clerk como proveedor de identidad

Clerk gestiona registro, login (email/Google/Apple), sesiones y tokens JWT. La aplicación mantiene su propio modelo `Artist` enlazado por `clerkId`, separando la identidad (gestionada por Clerk) del perfil de dominio (base de datos propia). Esta separación permite que la lógica de negocio no dependa de la disponibilidad del SDK de Clerk.

**[AÑADIR AL TFG]** Un detalle importante: la foto de perfil del artista se almacena en `artist.avatarUrl` (campo en BD, gestionado mediante subida a R2 desde el formulario de perfil). En ningún lugar de la aplicación se usa `user.imageUrl` de Clerk. Esta decisión evita acoplar la presentación pública del artista a la plataforma de autenticación: si el artista cambia su avatar en Clerk, el avatar de la galería no cambia, y viceversa.

### 9.2 Protección de rutas con proxy.ts

**[CORRECCIÓN]** El documento TFG menciona `proxy.ts` sin explicar por qué no se llama `middleware.ts`. En Next.js 16, el archivo de middleware fue renombrado de `middleware.ts` a `proxy.ts`. No es un nombre arbitrario: refleja que en Next.js 16 el middleware solo puede ejecutarse en el Edge Runtime, que tiene restricciones de API. Esta es una decisión específica de la versión 16 del framework.

```typescript
// proxy.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPrivate = createRouteMatcher([
  '/dashboard(.*)',
  '/api/galleries(.*)',
  '/api/artworks(.*)',
  '/api/artists(.*)',
  '/api/assets(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isPrivate(req)) await auth.protect()
})

export const config = {
  matcher: ['/((?!_next|monitoring|[^?]*\\.(?:html?|css|js|ico|png|svg)).*)', '/'],
}
```

Las rutas públicas (`/`, `/obras`, `/galleries`, `/galleries/[slug]`, `/galleries/[slug]/viewer`, `/artworks/[id]`, `/artists`, `/artists/[id]`, `/api/artworks/public`, `/api/galleries/public`, `/api/artists/public`) son accesibles sin autenticación.

### 9.3 Proxy de Clerk en Next.js 16

**[AÑADIR AL TFG]** En desarrollo, el SDK de Clerk intenta conectar directamente con `{dominio}.clerk.accounts.dev` desde el browser. Esto genera errores CORS. La solución implementada es redirigir esas peticiones a través del servidor Next.js, que actúa como proxy transparente:

```typescript
// next.config.ts — se ejecuta al iniciar el servidor
async rewrites() {
  const key     = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? ''
  const encoded = key.split('_')[2] ?? ''  // el dominio Clerk está codificado en base64
  if (!encoded) return []
  const domain  = `https://${Buffer.from(encoded, 'base64').toString().replace(/\$$/, '')}`
  return [{ source: '/api/clerk-proxy/:path*', destination: `${domain}/:path*` }]
},
```

Y en el layout raíz:
```typescript
// app/layout.tsx
<ClerkProvider proxyUrl={process.env.NEXT_PUBLIC_CLERK_PROXY_URL}>
```

Con `NEXT_PUBLIC_CLERK_PROXY_URL=http://localhost:3000/api/clerk-proxy` en `.env.local`.

---

## 10. Viewer 3D

### 10.1 Stack de renderizado

El viewer está construido con **React Three Fiber** (declarativo sobre Three.js) y **Drei** (utilidades: `useTexture`, `useGLTF`, `OrbitControls`).

La escena parte del manifest que provee el Server Component de la página:

```typescript
// app/galleries/[slug]/viewer/page.tsx (Server Component)
export default async function ViewerPage({ params }) {
  const { slug } = await params
  const gallery  = await db.gallery.findUnique({
    where:   { slug },
    include: { artist: { select: { clerkId: true } } },
  })
  if (!gallery || gallery.visibility === 'PRIVATE') notFound()

  const { userId } = await auth()
  const isOwner    = userId === gallery.artist.clerkId   // el artista puede guardar config

  const manifest = await buildManifest(gallery.id)       // cacheado con unstable_cache

  return <ViewerClient manifest={manifest} galleryId={gallery.id} isOwner={isOwner} />
}
```

`ViewerClient` es un Client Component que carga dinámicamente (SSR desactivado) el canvas de Three.js:

```typescript
// ViewerClient delega en GalleryCanvas (sin SSR)
const GalleryCanvas = dynamic<CanvasProps>(
  () => import('./gallery-canvas').then(m => ({ default: m.GalleryCanvas })),
  { ssr: false }
)
```

### 10.2 Renderizado de obras — textura y carga progresiva

Cada slot WALL_PLANE renderiza su textura CDN de manera progresiva gracias al sistema de Suspense de React Three Fiber:

```typescript
// components/viewer/artwork-wall-slot.tsx
function ArtworkTexturePlane({ url, artW, artH }) {
  const texture = useTexture(url, (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace
    tex.needsUpdate = true
  })
  return (
    <mesh position={[0, 0, 0.032]}>
      <planeGeometry args={[artW, artH]} />
      <meshStandardMaterial map={texture} roughness={0.88} metalness={0} />
    </mesh>
  )
}

// Cascada de fallbacks: gallery (1200px) → thumbnail (400px) → null (canvas gris)
const rawUrl = slot.artwork && 'gallery' in slot.artwork.assets
  ? ((slot.artwork.assets as FlatAssets).gallery || (slot.artwork.assets as FlatAssets).thumbnail)
  : null

// Cada slot tiene su propio Suspense y ErrorBoundary:
{rawUrl ? (
  <TextureErrorBoundary artW={artW} artH={artH}>
    <Suspense fallback={<PlainPlane color={EMPTY_COL} />}>
      <ArtworkTexturePlane url={rawUrl} artW={artW} artH={artH} />
    </Suspense>
  </TextureErrorBoundary>
) : (
  <PlainPlane color={EMPTY_COL} />
)}
```

`TextureErrorBoundary` es un class component React que captura errores de red o CORS del `useTexture` hook. Los buckets R2 públicos con dominio `*.r2.dev` sirven `Access-Control-Allow-Origin: *` automáticamente, por lo que la carga directa desde WebGL funciona sin proxy adicional.

### 10.3 Parámetros de escena — distinción manifest vs. tiempo real

**[CORRECCIÓN]** El TFG describe los parámetros visuales sin distinguir dos ámbitos con comportamientos muy distintos:

**Parámetros del manifest (persistidos en BD)**:
- `wallColor`: color hex de las paredes — campo `Gallery.wallColor` en Prisma.
- `floorMaterial`: material del suelo (`concrete`/`parquet`/`marble`) — `Gallery.floorMaterial`.
- `lightingPreset`: preset de iluminación base (`warm`/`neutral`/`dramatic`) — `Gallery.lightingPreset`.

Estos valores se cargan desde el manifest al abrir el viewer y pueden ser guardados por el artista propietario mediante el botón "Guardar configuración" del panel de controles, que llama a `PATCH /api/galleries/[id]`. El servicio de galería invalida el manifest cache tras la actualización, de modo que la siguiente visita carga la configuración guardada.

**Parámetros de tiempo real (solo en cliente, no persistidos)**:
- Intensidades de luz (ambiental, principal, focos de obra).
- Exposición del tone mapper.
- Visibilidad y estilo de alfombra.
- Niebla (near/far).

Estos parámetros se inicializan con valores por defecto y no tienen reflejo en la base de datos. Son herramientas de exploración del visitante, no configuración del artista.

El panel de controles (⚙) se posiciona en la esquina inferior izquierda para evitar el solapamiento con el panel de detalle de obra (esquina derecha). Solo el artista autenticado ve el botón "Guardar configuración", que aparece cuando los parámetros del manifest han cambiado respecto a los valores guardados.

### 10.4 Panel de detalle de obra

Al hacer clic sobre un marco en la galería, se abre `ArtworkOverlay`: un panel deslizable desde la derecha con imagen de alta resolución, título, artista, año, dimensiones, etiquetas y un enlace a la página de detalle pública.

La imagen se carga desde `FlatAssets.detail` (2400 px), con fallback a `FlatAssets.thumbnail` si el pipeline Inngest aún no ha generado el derivado de detalle. Una tecla Escape o clic fuera del marco cierra el panel.

---

## 11. Frontend — Dashboard y experiencia pública

### 11.1 Estrategia de datos

El dashboard es un conjunto de Client Components que leen datos mediante **TanStack Query v5**:

```typescript
// lib/hooks/use-artworks.ts
export function useArtworks() {
  return useQuery({
    queryKey: ['artworks'],
    queryFn:  () => fetch('/api/artworks').then(r => r.json()),
  })
}

export function usePublishArtwork() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, galleryId }: { id: string; galleryId: string }) =>
      fetch(`/api/artworks/${id}/publish`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ galleryId }),
      }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['artworks'] })
      qc.invalidateQueries({ queryKey: ['galleries'] })
    },
  })
}
```

Tras cada mutation (publicar, retirar, eliminar), TanStack Query invalida la caché local y refetcha los datos actualizados, manteniendo la UI siempre sincronizada sin necesidad de estado global ni de reiniciar la página.

### 11.2 Avatar del artista

**[AÑADIR AL TFG]** La foto de perfil del artista que aparece en el Topbar del dashboard y en las páginas públicas proviene de `artist.avatarUrl`, un campo en la base de datos que apunta a una URL del CDN de R2. El artista la gestiona desde `/dashboard/profile`. Este campo es independiente de la imagen de perfil de Clerk: si el artista tiene una foto en Google o GitHub (que Clerk podría exponer como `user.imageUrl`), no se usa automáticamente en Arvista 3D.

### 11.3 Páginas del dashboard

| Ruta | Contenido |
|---|---|
| `/dashboard` | Greeting, estadísticas reales (galerías, obras expuestas, total), grid de galerías, feed de actividad (mock) |
| `/dashboard/artworks` | Listado con thumbnails CDN, estado DRAFT/EXPOSED, acciones publicar/retirar, formulario nueva obra |
| `/dashboard/artworks/new` | Formulario editorial: sidebar imagen fija + campos tipografía serif |
| `/dashboard/artworks/[id]/edit` | Edición de obra existente, mismo layout |
| `/dashboard/galleries` | Listado con toggle público/privado, badge de capacidad, botón nueva galería |
| `/dashboard/galleries/new` | Formulario con vista perspectiva 3D interior como preview izquierda |
| `/dashboard/profile` | Perfil real (nombre, bio, web, avatar), `PATCH /api/artists/me` |
| `/dashboard/plan` | Plan actual, uso real, botones upgrade → Stripe Checkout, gestionar → Stripe Portal |

### 11.4 Páginas públicas — rutas dedicadas

**[AÑADIR AL TFG]** En la versión inicial, los enlaces de la barra de navegación apuntaban a anclas dentro de la landing (`/#obras`, `/#galerías`, `/#artistas`). La arquitectura actual los reemplaza con rutas dedicadas, cada una con su propio Server Component, metadatos y estructura de página independiente:

| Enlace de navegación (antes) | Ruta actual | Tipo de página |
|---|---|---|
| `/#obras` (ancla en landing) | `/obras` | Catálogo con `TopArtworks` + `ObrasCatalog` |
| `/#galerías` (ancla en landing) | `/galleries` | Catálogo con `FeaturedGalleries` + `GalleriesCatalog` |
| `/#artistas` (ancla en landing) | `/artists` | Catálogo con `FeaturedArtists` + `ArtistsCatalog` |
| — | `/artists/[id]` | Perfil público del artista (Server Component) |

Cada página de catálogo sigue un patrón de **dos capas** consistente:

**Capa 1 — Discovery (Server Component)**: renderizada en servidor, sin JavaScript en cliente. Muestra entre 3 y 4 elementos de alta relevancia (los más populares o más activos) de forma estática. Si no hay datos públicos disponibles, el componente retorna `null` y la capa desaparece sin dejar hueco vacío:

```typescript
// Ejemplo: featured-galleries.tsx — Server Component
export async function FeaturedGalleries() {
  const galleries = await db.gallery.findMany({
    where:   { visibility: 'PUBLIC' },
    orderBy: [{ slots: { _count: 'desc' } }, { createdAt: 'desc' }],
    take: 3,
    // ...
  })
  if (galleries.length === 0) return null  // ← sin sección si no hay datos
  return <section>...</section>
}
```

**Capa 2 — Catálogo (Client Component)**: se monta en cliente con `useEffect → fetch`. Aplica búsqueda y orden en el cliente (sin peticiones adicionales al servidor por cada keystroke). La barra de filtros es `sticky top-14.25 z-20` (57px de clearance para el nav fijo de altura 57px).

```typescript
// Estructura de página tipo — app/galleries/page.tsx
export default function GalleriesPage() {
  return (
    <>
      <Nav />
      <div className="pt-14.25">
        <FeaturedGalleries />          {/* Server Component, null si vacío */}
        <section id="catalog">
          <GalleriesCatalog />         {/* Client Component, search+sort en cliente */}
        </section>
      </div>
      <Footer />
      <ScrollReveal />
    </>
  )
}
```

### 11.5 APIs de catálogo público — detalles de implementación

**`GET /api/galleries/public`**: devuelve galerías con visibilidad `PUBLIC` incluyendo:

- Datos del artista: `id`, `name`, `avatarUrl` (para el avatar en las tarjetas).
- `exposedCount`: número de slots con `artworkId ≠ null` calculado con `_count.select` filtrado en Prisma.
- `previewImages`: hasta 3 URLs `assetThumbnail` de las primeras obras (ordenadas por `position`) para el mosaico de previsualización de la tarjeta.
- Búsqueda case-insensitive en `name` (`mode: 'insensitive'`). Orden por nombre o fecha.

```typescript
const galleries = await db.gallery.findMany({
  where: {
    visibility: 'PUBLIC',
    ...(search && { name: { contains: search, mode: 'insensitive' } }),
  },
  include: {
    artist: { select: { id: true, name: true, avatarUrl: true } },
    _count:  { select: { slots: { where: { artworkId: { not: null } } } } },
    slots: {
      where:   { artworkId: { not: null } },
      orderBy: { position: 'asc' },
      take: 3,
      select:  { artwork: { select: { assetThumbnail: true, title: true } } },
    },
  },
  orderBy: sort === 'name' ? { name: 'asc' } : { createdAt: 'desc' },
})
```

**`GET /api/artists/public`**: devuelve artistas que tienen al menos una galería pública. Incluye:

- `galleryCount` y `artworkCount`: `_count` con filtro `where` para contar solo galerías públicas y obras expuestas respectivamente.
- `primaryGallery`: la galería pública más reciente del artista, para el chip de enlace en la tarjeta del catálogo.
- Búsqueda por nombre. El orden "Más activos" (por `artworkCount` descendente) se aplica **en el cliente**, no en Prisma, porque Prisma no soporta `orderBy` combinado con `_count` que tiene `where` filters en la misma consulta.

```typescript
const artists = await db.artist.findMany({
  where: {
    galleries: { some: { visibility: 'PUBLIC' } },
    ...(search && { name: { contains: search, mode: 'insensitive' } }),
  },
  select: {
    id: true, name: true, bio: true, avatarUrl: true, website: true, createdAt: true,
    galleries: { where: { visibility: 'PUBLIC' }, orderBy: { createdAt: 'desc' },
                 take: 1, select: { slug: true, name: true } },
    _count: { select: {
      galleries: { where: { visibility: 'PUBLIC' } },
      artworks:  { where: { status: 'EXPOSED' } },
    } },
  },
})
```

### 11.6 Catálogo de artistas — decisiones UX justificadas

`ArtistsCatalog` implementa tres decisiones de diseño que tienen justificación técnica y de UX:

**Orden por actividad, no por fecha de alta**: el orden por defecto ("Más activos") ordena por número de obras expuestas descendente. Un visitante que llega a `/artists` busca artistas interesantes, no los más nuevos. El orden cronológico de registro es irrelevante para el descubrimiento artístico.

**Búsqueda simultánea en nombre y bio**:

```typescript
const q = search.toLowerCase()
let list = artists.filter(a => {
  if (!q) return true
  return a.name.toLowerCase().includes(q) || a.bio?.toLowerCase().includes(q)
})
```

Esto permite encontrar artistas por disciplina ("fotografía", "abstracto", "escultura digital") aunque el visitante no conozca el nombre del artista. La bio es el campo más descriptivo del perfil.

**Patrón de enlace en Server vs Client Components**: en `FeaturedArtists` (Server Component), el nombre del artista se renderiza como `<span>` en lugar de `<Link onClick={e => e.stopPropagation()}>`. **React no permite pasar event handlers a props de componentes en Server Components.** La tarjeta completa ya es un `<Link>` al perfil del artista, por lo que el nombre hereda ese enlace. En `ArtistsCatalog` (Client Component), el chip de galería usa `<Link onClick={e => e.stopPropagation()}>` para navegar a la galería sin activar el enlace principal de la tarjeta.

### 11.7 Perfil público de artista — `/artists/[id]`

```typescript
// app/artists/[id]/page.tsx (Server Component)
export default async function ArtistProfilePage({ params }) {
  const { id } = await params
  const artist  = await db.artist.findUnique({
    where: { id },
    include: {
      galleries: {
        where:   { visibility: 'PUBLIC' },
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { slots: { where: { artworkId: { not: null } } } } },
          slots:  {
            where:   { artworkId: { not: null } },
            take: 3,
            select:  { artwork: { select: { assetThumbnail: true } } },
          },
        },
      },
      _count: { select: {
        galleries: { where: { visibility: 'PUBLIC' } },
        artworks:  { where: { status: 'EXPOSED' } },
      } },
    },
  })

  if (!artist || artist.galleries.length === 0) notFound()
  // ...
}
```

La función `notFound()` se llama si el artista no tiene galerías públicas. Esto es deliberado: un artista sin presencia pública no debe tener perfil indexable (no hay nada que mostrar).

La sección hero usa `flex-wrap gap-x-8 gap-y-5` en la fila de estadísticas. Esto permite que los valores (nº galerías, nº obras) se reorganicen en varias líneas en viewports pequeños sin romper el layout ni requerir `@media` queries adicionales.

### 11.8 Vínculos cruzados entre páginas de contenido

El nombre del artista está enlazado a `/artists/[id]` en todas las páginas públicas. La implementación varía según si el componente es Server o Client:

| Componente | Tipo | Implementación del enlace al artista |
|---|---|---|
| `ArtworkInfoPanel` | Client | `<Link href={/artists/${artwork.artistId}}>` — `artistId` añadido al `select` del Server Component padre |
| `ArtistBar` (galería pública) | Client | `<Link href={/artists/${artistId}}>` — prop `artistId` añadida al componente |
| `galleries/[slug]/page.tsx` | Server | "Por [nombre]" y botón "Ver artista →" enlazan a `/artists/${gallery.artist.id}` |
| `FeaturedGalleries` | Server | Nombre del artista como `<span>` (sin `onClick`, regla de Server Components) |
| `TopArtworks` | Server | Nombre del artista como `<span>` (sin `onClick`) |
| `FeaturedArtists` | Server | Tarjeta completa enlazada a `/artists/${a.id}` como un único `<Link>` |
| `GalleriesCatalog` | Client | Chip de galería como `<Link onClick={e => e.stopPropagation()}>` (impide el click en la tarjeta padre) |

### 11.9 ManifestoSection — preview 3D de galería en la landing

La sección "01 Galerías" de la landing muestra una escena Three.js en vivo que simula el interior de una galería. Es el único uso de React Three Fiber fuera del viewer de galería propiamente dicho.

**Requisito de `'use client'` en el componente wrapper**:

```tsx
// components/landing/manifesto-section.tsx
'use client'  // OBLIGATORIO: next/dynamic con ssr:false solo funciona en Client Components
import dynamic from 'next/dynamic'

const GalleryPreview3D = dynamic(
  () => import('./gallery-preview-3d').then(m => ({ default: m.GalleryPreview3D })),
  { ssr: false, loading: () => <div className="w-full h-full art-p1" /> }
)
```

`ssr: false` prohíbe que Next.js renderice el componente en el servidor. En Next.js 16, esta opción solo es válida dentro de un Client Component — si se usa en un Server Component, el build lanza un error. El componente importado (`gallery-preview-3d.tsx`) también es Client Component porque usa hooks de R3F (`useFrame`) y Drei (`useTexture`).

**Carga de 5 texturas reales con `useTexture` (Drei)**:

```tsx
// Dentro de Scene() — requiere <Suspense fallback={null}> en el Canvas
const [tex31, tex32, tex14, tex15, tex1] = useTexture([
  '/images/preview/obra-31.jpg',   // kayaker en olas — pieza central pared fondo (2.4×3.0)
  '/images/preview/obra-32.jpg',   // samurai paper-cut — izquierda pared fondo (1.4×1.9)
  '/images/preview/obra-14.jpg',   // ciudad cyberpunk — derecha pared fondo (2.5×1.4, landscape)
  '/images/preview/obra-15.webp',  // figura sobre río — pared lateral izquierda (3.0×2.0)
  '/images/preview/obra-1.jpg',    // paisaje fantasía luna/sol — pared lateral derecha (3.0×1.7)
])
```

`useTexture` es un hook asíncrono (lanza una promesa que Suspense captura). Toda la función `Scene()` debe estar envuelta en `<Suspense fallback={null}>` dentro del Canvas. Las imágenes se almacenan en `public/images/preview/` y se sirven estáticamente por Next.js.

**Iluminación calibrada para evitar sobreexposición**:

En iteraciones anteriores de la escena se usaban `pointLight` de intensidad 22 (principal) y 14 (laterales), lo que producía un techo quemado (blob blanco de luz). La versión actual usa focos individuales por obra con intensidades reducidas:

```tsx
<ambientLight intensity={0.65} color="#fff9f0" />
<directionalLight position={[0, 8, 5]} intensity={0.4} color="#fffcf5" />
<pointLight position={[0, 2.0, 5.5]} intensity={2.5} color="#f0ecff" distance={12} decay={2} />
{/* Un foco por obra — pared fondo */}
<pointLight position={[-2.8, 3.7, -4.8]} intensity={5}   color="#fff4d6" distance={3}   decay={2} />
<pointLight position={[0,    3.7, -4.8]} intensity={7}   color="#fff4d6" distance={4.5} decay={2} />
<pointLight position={[2.9,  3.7, -4.8]} intensity={5}   color="#fff4d6" distance={3}   decay={2} />
{/* Focos paredes laterales */}
<pointLight position={[-4.8, 3.6, -1.5]} intensity={4.5} color="#fff4d6" distance={3.5} decay={2} />
<pointLight position={[4.8,  3.6, -1.5]} intensity={4.5} color="#fff4d6" distance={3.5} decay={2} />
```

**Cámara con paneo lateral para revelar paredes laterales**:

```tsx
function CameraRig() {
  useFrame(({ clock, camera }) => {
    const t   = clock.getElapsedTime()
    const pan = Math.sin(t * 0.16) * 0.44   // oscilación lenta ±0.44 rad
    camera.position.set(0, 1.75 + Math.sin(t * 0.09) * 0.03, 5.8)
    camera.lookAt(Math.sin(pan) * 3.6, 1.62, -2.0)  // mira ±3.6u en x
  })
  return null
}
```

Con la cámara fija en z=5.8 y FOV=65°, las paredes laterales (x=±5) están justo en el borde del campo de visión. El paneo del punto de mira de ±3.6 unidades en X desplaza horizontalmente la dirección de la cámara, revelando las obras de las paredes laterales de forma progresiva sin mover la posición física de la cámara. El resultado simula un giro natural de cabeza al observar la sala.

**Prevención de z-fighting — análisis detallado**:

Se detectaron dos casos de z-fighting distintos en la escena que producían parpadeo visual:

*Caso 1 — Zócalos laterales*:

Los zócalos (boxGeometry depth=0.04) estaban centrados en x=±5.02 con rotation `[0, ±PI/2, 0]`. Con la matriz de rotación R_y(PI/2), el eje local +z mapea al eje mundo +x. La cara interior del box (local z=+0.02) quedaba en:

```
world_x = -5.02 + 0.02 = -5.00  ← idéntico al plano de pared
```

Ambas superficies (cara del box y plano de pared) tienen la misma profundidad en cámara y la misma normal (+x). El depth buffer no puede diferenciarlas → z-fighting.

**Fix**: centrar los boxes EN el plano de pared (x=±5.00):
```
cara interior: world_x = -5.00 + 0.02 = -4.98  ← 2 cm en sala (visible, sin coincidencia)
cara exterior: world_x = -5.00 - 0.02 = -5.02  ← dentro del muro → back-face culled
```

*Caso 2 — Placa de museo vs canvas de obra central*:

La placa de museo era un `planeGeometry` en `[0, 0.78, -5.14]`. El canvas de la obra central (grupo en z=-5.15, offset local +0.01) también resolvía a z=-5.14 en coordenadas mundo. Además, los rangos Y se solapaban: placa de y=0.64 a y=0.92, canvas desde y=0.85 → solapamiento de 7cm vertical donde ambas superficies coincidían en XY **y** Z.

**Fix**: mover la placa a `[0, 0.58, -5.12]`:
- Nueva posición Y: top en y=0.72, 13cm por debajo del canvas (y=0.85). Sin solapamiento en XY.
- Nueva Z: -5.12, 2cm más cerca de cámara que el canvas (-5.14). Sin coincidencia de profundidad.

**Tone mapping y materiales**:

```tsx
<Canvas
  gl={{
    antialias:           true,
    toneMapping:         THREE.ACESFilmicToneMapping,
    toneMappingExposure: 1.05,   // ligeramente por encima de 1.0 para realzar blancos
  }}
>
```

ACES Filmic es el estándar de la industria cinematográfica para comprimir HDR a LDR. Evita la saturación de blancos a intensidades altas y mejora el contraste percibido en los colores medios. El suelo usa `MeshPhysicalMaterial` con roughness=0.06 y reflectivity=0.42 para simular un suelo de galería ligeramente pulido.

### 11.10 GalleryRoomsCollage — previsualización CSS de salas

Una sección estática CSS debajo de `ManifestoSection` muestra dos variantes de sala como avance de las posibilidades estéticas de la plataforma. No usa JavaScript, hooks ni estado — es un **Server Component puro** (`'use client'` ausente).

```
┌──────────────────────────────────────┐  ┌──────────────────────────────────────┐
│  Sala Oscura         bg: #09070d     │  │  Galería Contemporánea  bg: #f2ede6  │
│                                      │  │                                      │
│     ┌──────────────────────┐         │  │  ┌────────────────────┐  ┌──────┐   │
│     │   obra_14 cyberpunk  │         │  │  │  obra_1 fantasía   │  │ob_32 │   │
│     │   ciudad neon noche  │         │  │  │  luna y sol        │  │samuráí│  │
│     └──────────────────────┘         │  │  └────────────────────┘  └──────┘   │
│  ┌──────┐                            │  │                                      │
│  │ob_15 │                            │  │                                      │
│  │ río  │  [gradiente suelo oscuro]  │  │         [gradiente suelo claro]      │
│  └──────┘__________________________  │  │ ____________________________________  │
│  Sala Oscura                         │  │ Galería Contemporánea                │
│  ATMÓSFERA ÍNTIMA · LUZ PUNTUAL  ◈  │  │ LUZ NATURAL · ESPACIO ABIERTO    ◈  │
└──────────────────────────────────────┘  └──────────────────────────────────────┘
```

Elementos CSS de cada tarjeta de sala:

| Elemento | Implementación CSS |
|---|---|
| Fondo de sala | `background: <color>; aspect-ratio: 4/3` |
| Sombra de techo | `linear-gradient(to bottom, rgba(0,0,0,X), transparent)` en 10–14% superior |
| Línea suelo/pared | `height: 1px; bottom: 22%; background: <wallLineColor>` |
| Suelo | `linear-gradient(to top, <floorColor>, <bg>)` en 22% inferior |
| Obras | `<img>` con `position: absolute`, `border` (marco) y `box-shadow` (profundidad/glow) |
| Vignette | `radial-gradient(ellipse at 50% 34%, transparent X%, rgba(0,0,0,Y) 100%)` |
| Etiqueta | `position: absolute; bottom: 4; left: 5` — nombre y subtipo de sala |

Para la Sala Oscura, la `box-shadow` incluye un componente de glow de color para el cuadro cyberpunk: `0 0 55px rgba(110,30,200,0.22), 0 18px 44px rgba(0,0,0,0.97)`. Para la Galería Contemporánea se usa una sombra seca clásica: `5px 8px 24px rgba(0,0,0,0.22)`.

---

## 12. Billing — Stripe

### 12.1 Productos

| Plan | Precio | Stripe Product ID |
|---|---|---|
| Básico | Gratuito | — |
| Estándar | 12 €/mes | `price_1TjOPPQWm6hAJLTkGKqWRSyD` |
| Premium | 29 €/mes | `price_1TjOPQQWm6hAJLTkheEURe6R` |

### 12.2 Flujo de pago

1. El artista hace clic en "Mejorar a Estándar" en `/dashboard/plan`.
2. El frontend llama a `POST /api/stripe/checkout` con `{ plan: 'STANDARD' }`.
3. El handler crea (o reutiliza) un `Customer` en Stripe vinculado al `artistId`, crea una `CheckoutSession` con el Price ID correspondiente y devuelve la URL de Stripe.
4. El browser redirige a la página de pago hosted de Stripe.
5. Tras el pago exitoso, Stripe envía un webhook a `POST /api/webhooks/stripe`.
6. El handler verifica la firma HMAC (`stripe.webhooks.constructEvent`), extrae el `customerId` y el `priceId`, y actualiza `Artist.plan` en base de datos.

```typescript
// app/api/webhooks/stripe/route.ts (fragmento)
export async function POST(req: Request) {
  const body      = await req.text()
  const signature = req.headers.get('stripe-signature')!

  const event = stripe.webhooks.constructEvent(
    body, signature, process.env.STRIPE_WEBHOOK_SECRET!
  )

  const RELEVANT = ['customer.subscription.created',
                    'customer.subscription.updated',
                    'customer.subscription.deleted']

  if (!RELEVANT.includes(event.type)) return NextResponse.json({ ok: true })

  const sub      = event.data.object as Stripe.Subscription
  const priceId  = sub.items.data[0]?.price?.id
  const isActive = ['active', 'trialing'].includes(sub.status)
  const plan     = (isActive && PRICE_TO_PLAN[priceId ?? '']) ?? 'BASIC'

  await db.artist.updateMany({
    where: { stripeCustomerId: sub.customer as string },
    data:  { plan, stripeSubscriptionId: isActive ? sub.id : null },
  })

  return NextResponse.json({ ok: true })
}
```

La verificación de firma HMAC es crítica: sin ella, cualquier agente externo podría simular un webhook de Stripe y elevar el plan de un artista sin haber pagado.

---

## 13. Observabilidad — Sentry

Sentry está configurado en tres contextos de ejecución: cliente (`sentry.client.config.ts`), servidor (`sentry.server.config.ts`) y Edge Runtime (`sentry.edge.config.ts`, para `proxy.ts`).

Los errores 500 inesperados en `serviceErrorToResponse()` se capturan explícitamente con `Sentry.captureException(err)` antes de devolver la respuesta HTTP. Los errores de negocio esperados (FORBIDDEN, CAPACITY_REACHED, etc.) no se envían a Sentry, evitando ruido en el sistema de alertas.

El tunnel `/monitoring` permite que los eventos de Sentry pasen por el servidor Next.js, evitando que los bloqueadores de anuncios los intercepten en el browser.

---

## 14. Testing

### 14.1 Estrategia adoptada

Se adopta una estrategia de tres capas con prioridad decreciente:

1. **Tests unitarios de servicios** (prioridad alta): verifican la lógica de negocio con Prisma mockeado. No requieren base de datos ni red.
2. **Tests de integración de Route Handlers** (prioridad media): verifican que los handlers responden correctamente a peticiones HTTP con los mocks apropiados.
3. **Tests E2E** (opcional): flujo completo en navegador con Playwright. Recomendado antes del primer deploy a producción.

No se testean componentes React ni el viewer 3D: el ROI es bajo y cambian con frecuencia.

### 14.2 Configuración de Vitest

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import tsconfigPaths    from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    globals:     true,
    coverage: {
      provider: 'v8',
      include:  ['lib/services/**'],
    },
  },
})
```

### 14.3 Patrón de mock con vi.hoisted

Vitest hoistea los `vi.mock()` al inicio del archivo antes de cualquier declaración. Para que las variables del mock sean accesibles dentro del factory, deben declararse con `vi.hoisted()`:

```typescript
// __tests__/unit/services/artwork.service.test.ts
const mockDb = vi.hoisted(() => ({
  artwork:      { findFirst: vi.fn(), update: vi.fn() },
  gallery:      { findFirst: vi.fn() },
  gallerySlot:  { update: vi.fn() },
  $transaction: vi.fn().mockImplementation((ops: Promise<unknown>[]) => Promise.all(ops)),
}))

vi.mock('@/lib/db',    () => ({ db: mockDb }))
vi.mock('next/cache',  () => ({ revalidateTag: vi.fn() }))
```

### 14.4 Ejemplo de test — publicación de obra ajena

**[AÑADIR AL TFG]** El TFG describe qué se prueba pero no incluye ningún fragmento. A continuación se muestra el test más representativo del patrón `vi.hoisted()` y cómo se validan los errores de negocio:

```typescript
describe('publishArtwork', () => {
  it('lanza FORBIDDEN si la obra no pertenece al artista', async () => {
    // La obra existe pero pertenece a otro artista (findFirst devuelve null)
    mockDb.artwork.findFirst.mockResolvedValue(null)

    await expect(
      publishArtwork('artwork-id', 'gallery-id', 'otro-artista-id', 'BASIC')
    ).rejects.toThrow('FORBIDDEN')
  })

  it('lanza CAPACITY_REACHED si la galería ha alcanzado el límite del plan', async () => {
    mockDb.artwork.findFirst.mockResolvedValue({ id: 'aw1', type: 'PAINTING', artistId: 'a1' })
    mockDb.gallery.findFirst.mockResolvedValue({
      id: 'gal1', artistId: 'a1',
      // BASIC = 10 obras; galería con 10 slots ocupados
      slots: Array.from({ length: 10 }, (_, i) => ({
        id: `slot${i}`, displayMode: 'WALL_PLANE', artworkId: `aw${i}`,
      })),
    })

    await expect(
      publishArtwork('aw1', 'gal1', 'a1', 'BASIC')
    ).rejects.toThrow('CAPACITY_REACHED')
  })

  it('asigna slot y actualiza estado en transacción atómica', async () => {
    const mockArtwork = { id: 'aw1', type: 'PAINTING', artistId: 'a1', status: 'DRAFT' }
    const freeSlot    = { id: 'slot1', displayMode: 'WALL_PLANE', artworkId: null }

    mockDb.artwork.findFirst.mockResolvedValue(mockArtwork)
    mockDb.gallery.findFirst.mockResolvedValue({
      id: 'gal1', artistId: 'a1', slots: [freeSlot],
    })
    mockDb.$transaction.mockResolvedValue([{ ...mockArtwork, status: 'EXPOSED' }])

    const result = await publishArtwork('aw1', 'gal1', 'a1', 'BASIC')

    expect(result.status).toBe('EXPOSED')
    expect(mockDb.$transaction).toHaveBeenCalledTimes(1)
  })
})
```

### 14.5 Cobertura de tests

| Archivo | Función | Casos |
|---|---|---|
| `artwork.service.test.ts` | `publishArtwork` | Obra ajena (FORBIDDEN), galería ajena (FORBIDDEN), capacidad llena por plan, sin slot WALL_PLANE libre, sin slot FLOOR_MODEL libre, exposición correcta pintura, exposición correcta escultura |
| `artwork.service.test.ts` | `unpublishArtwork` | Obra ajena (FORBIDDEN), obra no expuesta (INVALID_STATE), retirada correcta con liberación de slot |
| `gallery.service.test.ts` | `assertGalleryQuota` | BASIC 0→ok, BASIC 1→error; STANDARD 1→ok, STANDARD 2→error; PREMIUM 2→ok, PREMIUM 3→error |
| `gallery.service.test.ts` | `deleteGallery` | Galería ajena (FORBIDDEN), sin obras (sin updateMany), con obras expuestas (→DRAFT) |
| `manifest.service.test.ts` | `buildManifest` | Galería inexistente, estructura correcta, assets WALL_PLANE, assets FLOOR_MODEL, dimensiones |
| `artworks.test.ts` | `POST /api/artworks` | 401 sin auth, 400 sin título, 400 tipo inválido, 201 correcto |
| `artworks.test.ts` | `POST /api/artworks/[id]/publish` | 400 sin galleryId, 403 FORBIDDEN, 409 CAPACITY_REACHED, 200 correcto |

**Total: 33 tests, 4 archivos, tiempo de ejecución ~250 ms.**

---

## 15. Decisiones técnicas y trade-offs

**[CORRECCIÓN]** El TFG presenta estas decisiones en forma de párrafos narrativos. El formato de tabla es más claro, escaneable y habitual en memorias de ingeniería:

| Decisión | Alternativa descartada | Razón de la elección |
|---|---|---|
| Next.js monolítico | Separar frontend/backend en microservicios | Menor complejidad operativa para MVP; tipos compartidos sin generación de código |
| Upload via servidor Next.js | Upload directo a R2 con URL prefirmada | El PUT directo desde browser genera CORS con R2; el servidor como proxy lo resuelve sin configuración adicional en R2 |
| Tailwind v4 | Tailwind v3 / CSS Modules | Utilidades directas de variables CSS (`@theme`), sin configuración de purge, oklch nativo |
| `unstable_cache` | Redis / Vercel KV | Sin infraestructura adicional; invalidación por tags suficiente para el volumen actual |
| R2 + CDN Cloudflare | AWS S3 + CloudFront | Sin coste de egress (R2 no cobra por transferencia saliente); CDN incluida; API 100% compatible con S3 |
| Inngest | BullMQ / SQS | Sin gestión de colas propia; UI de desarrollo integrada; pasos reanudables sin estado externo |
| Clerk | Auth.js / Supabase Auth | Integración nativa con Next.js 16; páginas de login customizables; gestión de sesiones incluida |
| Stripe Billing | Paddle / Lemon Squeezy | Estándar de la industria; webhooks confiables; soporte SCA europeo |
| Vitest | Jest | TypeScript nativo sin configuración extra; 10–20× más rápido; alias `@/` soportados directamente |
| Prisma | Drizzle / TypeORM | Migraciones automáticas; cliente tipado generado; schema legible sin SQL |
| `useState` en viewer | Zustand / Jotai | Suficiente para la complejidad actual; sin dependencia extra |
| Proxy inverso para Clerk | Variables de entorno con el dominio Clerk | El dominio Clerk está codificado en base64 en la clave pública, sin necesidad de variable adicional |
| 3 variantes síncronas + Inngest | Solo Inngest (async) | La galería 3D necesita la textura inmediatamente; no depender de Inngest en desarrollo |
| Server Component para discovery + Client Component para catálogo | Solo Client Component (fetch en cliente) | Los elementos destacados se renderizan en servidor sin JavaScript, mejorando el tiempo hasta primer pintado; el catálogo con búsqueda y filtros necesita estado React y se mantiene en cliente |
| Búsqueda y orden del catálogo en cliente | Búsqueda en servidor (query param + refetch) | Evita una petición de red por cada keystroke; el volumen actual de artistas/galerías (<1000) es manejable en memoria; si crece, migrar a búsqueda en servidor es un cambio aislado al hook de fetch |
| `<span>` para nombres en Server Components | `<Link onClick={...}>` | React no permite event handlers en Server Components; la tarjeta completa ya es un `<Link>`, el nombre hereda el enlace sin necesidad de `onClick` |
| GalleryRoomsCollage como Server Component CSS | Three.js / R3F para las salas extra | El collage CSS carga instantáneamente, es indexable, y no añade peso al bundle JavaScript del cliente; las salas son ilustrativas, no interactivas |
| Imágenes de preview en `public/images/preview/` | Assets en R2/CDN | Las imágenes son parte del código fuente (obras de demostración fijas, no dinámicas); servirlas estáticamente elimina latencia de CDN y simplifica el deploy |
| Zócalos embebidos en el plano de pared (center en x=±5.00) | Zócalos desplazados (x=±5.02) | Con center a ±5.02, la cara interior del box tras la rotación coincide exactamente con el plano de pared a ±5.00 → z-fighting; centrar el box EN el plano pone la cara interior 2cm dentro de la sala y la cara exterior culled por back-face |
| `revalidateTag(tag, {})` con 2 argumentos | `revalidateTag(tag)` con 1 argumento | Next.js 16 requiere el segundo argumento obligatoriamente; omitirlo provoca un error en tiempo de ejecución que Next.js 15 y anteriores no tenían |

---

## 16. Estructura de carpetas

```
arvista-3d/
├── app/
│   ├── page.tsx                  # Landing (Server Component, consulta viewCount)
│   ├── layout.tsx                # Layout raíz con ClerkProvider (proxyUrl)
│   ├── providers.tsx             # TanStack Query QueryClientProvider
│   ├── global-error.tsx          # Sentry error boundary nivel raíz
│   ├── sign-in/[[...sign-in]]/   # Login con diseño split-screen branded
│   ├── sign-up/[[...sign-up]]/   # Registro con diseño split-screen branded
│   ├── obras/                    # Catálogo público de obras (TopArtworks + ObrasCatalog)
│   ├── artworks/[id]/            # Detalle público (imágenes CDN, viewCount++)
│   ├── galleries/
│   │   ├── page.tsx              # Catálogo público de galerías (FeaturedGalleries + GalleriesCatalog)
│   │   └── [slug]/               # Vista de galería pública
│   │       └── viewer/           # Viewer 3D (Server → ViewerClient)
│   ├── artists/
│   │   ├── page.tsx              # Catálogo público de artistas (FeaturedArtists + ArtistsCatalog)
│   │   └── [id]/page.tsx         # Perfil público de artista (guard: sin galerías → notFound)
│   ├── dashboard/
│   │   ├── page.tsx              # Home con estadísticas reales
│   │   ├── artworks/             # Gestión de obras + formulario nuevo/editar
│   │   ├── galleries/            # Gestión de galerías + formulario nueva galería
│   │   ├── profile/              # Perfil (nombre, bio, web, avatar R2)
│   │   └── plan/                 # Plan y billing Stripe
│   └── api/
│       ├── artists/me/
│       ├── galleries/[id]/
│       │   └── manifest/
│       ├── artworks/[id]/
│       │   ├── publish/
│       │   ├── unpublish/
│       │   ├── trigger-processing/
│       │   └── public/              # Detalle público + viewCount++
│       ├── artworks/public/
│       ├── galleries/public/     # Catálogo público: galerías + exposedCount + previewImages
│       ├── artists/public/       # Catálogo público: artistas + conteo + primaryGallery
│       ├── assets/
│       │   ├── artwork-upload/   # Subida multipart via servidor (en uso)
│       │   ├── avatar-upload/    # Subida avatar via servidor (en uso)
│       │   └── presigned-url/    # Subida directa R2 (en repo, no en dashboard actual)
│       ├── inngest/
│       ├── clerk-proxy/          # Proxy Clerk (generado por rewrites en next.config.ts)
│       ├── stripe/checkout|portal|invoices/
│       └── webhooks/stripe/
│
├── components/
│   ├── landing/                  # Secciones de la landing page
│   │   ├── manifesto-section.tsx     # Sección "01 Galerías" con preview 3D (Client, ssr:false)
│   │   ├── gallery-preview-3d.tsx    # Escena Three.js R3F — 5 texturas, 3 paredes, zócalos
│   │   └── gallery-rooms-collage.tsx # Previsualización CSS de 2 salas (Server Component puro)
│   ├── dashboard/                # Panel del artista (forms, lists, grids)
│   │   └── first-steps-banner.tsx # Banner de onboarding para artistas sin galerías/obras
│   ├── viewer/                   # Viewer 3D
│   │   ├── gallery-canvas.tsx    # Canvas R3F + SceneControls + ArtworkOverlay
│   │   ├── gallery-scene.tsx     # Escena 3D completa (sala, luces, slots)
│   │   ├── artwork-wall-slot.tsx # Slot de pared (marco + textura CDN)
│   │   ├── artwork-overlay.tsx   # Panel de detalle de obra (FlatAssets y ModelAssets)
│   │   ├── scene-controls.tsx    # Panel ⚙ (bottom-left, save config, "✓ Guardado")
│   │   ├── viewer-mobile-hint.tsx # Hint táctil en móvil, auto-oculto a 4s
│   │   └── viewer-client.tsx     # Wrapper de dynamic import
│   ├── artwork/                  # ArtworkImageZone (CDN), ArtworkInfoPanel (link artista)
│   ├── gallery/                  # Hero, masonry, artist bar (artist-bar con link a /artists/[id])
│   ├── public/                   # Componentes de páginas públicas para visitantes
│   │   ├── obras-catalog.tsx         # Client — búsqueda/filtro obras, thumbnails CDN
│   │   ├── galleries-catalog.tsx     # Client — búsqueda/orden galerías, mosaico preview
│   │   ├── artists-catalog.tsx       # Client — búsqueda (nombre+bio), orden por actividad
│   │   ├── top-artworks.tsx          # Server — top 4 obras por viewCount (null si vacío)
│   │   ├── featured-galleries.tsx    # Server — 3 galerías por obras expuestas (null si vacío)
│   │   └── featured-artists.tsx      # Server — 3 artistas por obras expuestas (null si vacío)
│   ├── layout/                   # Nav, Footer
│   └── ui/                       # ScrollReveal, cursor personalizado
│
├── lib/
│   ├── services/
│   │   ├── artist.service.ts     # PLAN_LIMITS, getOrCreateArtist
│   │   ├── gallery.service.ts    # assertGalleryQuota, createGallery, deleteGallery
│   │   ├── artwork.service.ts    # publishArtwork, unpublishArtwork
│   │   └── manifest.service.ts   # buildManifest con unstable_cache
│   ├── functions/
│   │   └── process-artwork-upload.ts  # Inngest function (Sharp 3 variantes)
│   ├── hooks/                    # TanStack Query + utilidades de UI
│   │   ├── use-artist.ts         # useArtist, useUpdateArtist
│   │   ├── use-galleries.ts      # useGalleries, useUpdateGallery, etc.
│   │   ├── use-artworks.ts       # useArtworks, usePublishArtwork, etc.
│   │   └── use-focus-trap.ts     # Confina el foco de teclado dentro de modales
│   ├── schemas/                  # Zod schemas (CreateGallery, UpdateGallery, etc.)
│   ├── labels.ts                 # TYPE_LABEL compartido (fuente de verdad para tipos de obra)
│   ├── db.ts                     # Singleton Prisma
│   ├── r2.ts                     # Cliente R2 + cdnUrl()
│   ├── stripe.ts                 # Cliente Stripe + PRICE_TO_PLAN
│   ├── inngest.ts                # Cliente Inngest + tipos de eventos
│   └── api-helpers.ts            # requireArtist() + serviceErrorToResponse()
│
├── prisma/
│   ├── schema.prisma             # Esquema completo del dominio
│   └── migrations/               # 2 migraciones aplicadas en Neon
│
├── types/
│   └── manifest.ts               # GalleryManifest, FlatAssets, ModelAssets
│
├── __tests__/
│   ├── unit/services/
│   └── integration/api/
│
├── docs/
│   ├── AUDIT.md              # Auditoría técnica: bugs, inconsistencias, mejoras
│   ├── BUSINESS_RULES.md
│   ├── GALLERY_MANIFEST.md
│   ├── STACK.md
│   ├── STATUS.md
│   ├── TESTING_MANUAL.md
│   ├── TFG_GUIDE.md
│   ├── TFG_MEJORAS.md        # Correcciones específicas al documento TFG
│   └── VISUAL_AUDIT.md       # Auditoría visual/UX con estado de implementación
│
├── public/
│   └── images/
│       ├── obra-preview.jpg          # (alias legacy, apunta a obra-31)
│       └── preview/                  # Obras de demostración para preview 3D y collage CSS
│           ├── obra-31.jpg           # Kayaker en olas azules/doradas (pieza central galería)
│           ├── obra-32.jpg           # Samurai paper-cut (pared fondo izquierda + collage)
│           ├── obra-14.jpg           # Ciudad cyberpunk neon (pared fondo derecha + collage)
│           ├── obra-15.webp          # Figura sobre río oscuro (pared lateral izquierda + collage)
│           └── obra-1.jpg            # Paisaje fantasía luna/sol (pared lateral derecha + collage)
│
├── proxy.ts                      # Clerk middleware (Next.js 16)
├── next.config.ts                # remotePatterns R2 + rewrites Clerk proxy
├── vitest.config.ts
├── sentry.client.config.ts
├── sentry.server.config.ts
└── CLAUDE.md
```

---

## 17. Variables de entorno

| Variable | Servicio | Descripción |
|---|---|---|
| `DATABASE_URL` | Neon | Cadena de conexión PostgreSQL |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk | Clave pública (contiene el dominio Clerk en base64) |
| `CLERK_SECRET_KEY` | Clerk | Clave secreta (solo servidor) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Clerk | Ruta de login (`/sign-in`) |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Clerk | Ruta de registro (`/sign-up`) |
| `NEXT_PUBLIC_CLERK_PROXY_URL` | Clerk | URL del proxy (`http://localhost:3000/api/clerk-proxy`) |
| `STRIPE_SECRET_KEY` | Stripe | Clave secreta |
| `STRIPE_WEBHOOK_SECRET` | Stripe | Secreto de verificación HMAC de webhooks |
| `STRIPE_PRICE_STANDARD` | Stripe | Price ID del plan Estándar |
| `STRIPE_PRICE_PREMIUM` | Stripe | Price ID del plan Premium |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe | Clave pública |
| `R2_ACCOUNT_ID` | Cloudflare R2 | ID de cuenta |
| `R2_ACCESS_KEY_ID` | Cloudflare R2 | Access key |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 | Secret key |
| `R2_BUCKET_NAME` | Cloudflare R2 | Nombre del bucket |
| `R2_PUBLIC_URL` | Cloudflare R2 | URL pública del CDN (dominio r2.dev o personalizado) |
| `INNGEST_EVENT_KEY` | Inngest | Clave de envío de eventos |
| `INNGEST_SIGNING_KEY` | Inngest | Clave de verificación de webhooks Inngest |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry | DSN del proyecto (EU region, `ingest.de.sentry.io`) |
| `SENTRY_AUTH_TOKEN` | Sentry | Token para subir source maps en build |

---

## 18. Comandos disponibles

```bash
npm run dev            # Servidor de desarrollo (Next.js + Turbopack)
npm run build          # Build de producción (sube source maps a Sentry)
npm run start          # Servidor de producción
npm run test           # Tests con Vitest (una ejecución)
npm run test:watch     # Tests en modo watch
npm run test:coverage  # Tests con informe de cobertura lcov
npm run db:generate    # Regenerar cliente Prisma tras cambios en schema
npm run db:migrate     # Aplicar nuevas migraciones a la BD
npm run db:studio      # Abrir Prisma Studio (GUI de BD local)

# Desarrollo con Stripe (reenvío de webhooks):
npx stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Desarrollo con Inngest (pipeline de imágenes asíncrono):
npx inngest-cli@latest dev
```

---

## 19. Flujo completo de uso (caso de uso principal)

```
1. Registro
   └── Clerk crea identidad → primer request autenticado →
       getOrCreateArtist() crea Artist (plan BASIC, clerkId vinculado)

2. Crear galería
   ├── assertGalleryQuota() verifica límite de plan
   └── Gallery creada + 8 GallerySlots (7 WALL_PLANE + 1 FLOOR_MODEL)

3. Subir obra
   ├── POST /api/artworks → Artwork (DRAFT, assets null)
   ├── POST /api/assets/artwork-upload (multipart) →
   │     ├── Sharp sync: thumbnail.webp (400px) → R2
   │     ├── Sharp sync: gallery.webp (1200px) → R2
   │     ├── db.artwork.update(assetThumbnail, assetGallery)
   │     └── inngest.send('artwork/uploaded') →
   │           Paso 1: descarga original de R2
   │           Paso 2: Sharp → 3 variantes → R2
   │           Paso 3: db.artwork.update(thumbnail, gallery, detail)
   └── Frontend muestra thumbnail inmediatamente (no espera a Inngest)

4. Publicar
   ├── POST /api/artworks/[id]/publish { galleryId }
   └── publishArtwork(): 4 validaciones → transacción atómica →
       Artwork(EXPOSED) + GallerySlot.artworkId asignado +
       revalidateTag("manifest-{galleryId}", {})

5. Hacer galería pública
   └── PATCH /api/galleries/[id] { visibility: "PUBLIC" }

6. Descubrimiento público (visitor — rutas de catálogo)
   ├── / (landing) →
   │     ManifestoSection: escena Three.js en vivo (5 obras reales, paneo automático)
   │     GalleryRoomsCollage: previsualización CSS de 2 tipos de sala
   │     ShowcaseGrid: 6 obras ordenadas por viewCount desc (Server Component)
   ├── /obras → TopArtworks (Server) + ObrasCatalog (Client, fetch a /api/artworks/public)
   ├── /galleries → FeaturedGalleries (Server, 3 más llenas) + GalleriesCatalog (Client)
   ├── /artists → FeaturedArtists (Server, 3 más activos) + ArtistsCatalog (Client)
   └── /artists/[id] → Perfil público: avatar, bio, estadísticas, grid de galerías públicas

7. Visita a una galería (visitor)
   ├── /galleries/[slug] → página pública con hero, masonry de obras, "Ver artista →" → /artists/[id]
   ├── /galleries/[slug]/viewer →
   │     buildManifest() → GalleryManifest (cacheado en servidor) →
   │     R3F renderiza sala con texturas gallery.webp desde CDN
   ├── Clic en marco → ArtworkOverlay (imagen detail.webp, metadatos, "Ver más →")
   ├── /artworks/[id] → GET /api/artworks/[id]/public → viewCount++
   │     Panel muestra "Por [nombre artista]" → link a /artists/[id]
   └── viewCount++ retroalimenta ShowcaseGrid y TopArtworks en próximas cargas

8. Configurar escena (artista propietario en el viewer)
   ├── ⚙ abre panel de controles (bottom-left)
   ├── Artista cambia color de pared o material de suelo
   ├── Botón "Guardar configuración" aparece (isDirty)
   └── PATCH /api/galleries/[id] { wallColor, floorMaterial } →
       revalidateTag("manifest-{galleryId}", {}) →
       próxima visita carga la configuración guardada
```

---

## 20. Aspectos académicos relevantes

### 20.1 Patrones de diseño aplicados

- **Repository Pattern**: los servicios (`artwork.service.ts`, `gallery.service.ts`) actúan como repositorios que encapsulan el acceso a datos. Los Route Handlers no acceden a Prisma directamente.
- **Domain Events**: Inngest implementa procesamiento basado en eventos de dominio (`artwork/uploaded`). El servicio publica el evento y no sabe quién lo consume.
- **CQRS ligero**: separación entre lecturas (Server Components, TanStack Query) y escrituras (mutations a través de Route Handlers y servicios).
- **Optimistic locking vía constraint de BD**: la restricción `@unique` en `GallerySlot.artworkId` previene race conditions en la asignación de slots sin necesidad de locks explícitos o transacciones serializables.
- **Facade**: `requireArtist()` y `serviceErrorToResponse()` en `api-helpers.ts` actúan como fachadas que encapsulan la autenticación Clerk y la traducción de errores de dominio a HTTP.

### 20.2 Principios SOLID aplicados

- **Single Responsibility**: cada servicio de dominio tiene una única responsabilidad. `gallery.service.ts` gestiona galerías, `artwork.service.ts` gestiona obras; no hay cruce de responsabilidades.
- **Open/Closed**: `PLAN_LIMITS` es la única fuente de verdad; añadir un plan (por ejemplo, "Enterprise") no requiere modificar los servicios, solo el objeto de constantes.
- **Dependency Inversion**: los servicios dependen del cliente Prisma (`db`), no de la implementación concreta de PostgreSQL. En tests, `db` se sustituye por un mock sin cambiar el servicio.

### 20.3 Seguridad

- **Verificación de propiedad**: todas las operaciones de escritura verifican que el artista autenticado es el propietario del contenido. Un artista no puede publicar en una galería ajena aunque conozca su ID.
- **Validación de entrada con Zod**: todos los endpoints privados validan el cuerpo de la petición antes de llegar a la capa de dominio. Los errores de validación se devuelven con detalle de campos.
- **Verificación HMAC en webhooks de Stripe**: `stripe.webhooks.constructEvent(body, signature, secret)` verifica que el webhook procede de Stripe y no ha sido modificado en tránsito.
- **Source maps cifrados**: los mapas de código no se exponen en el bundle público del cliente; se suben a Sentry en el build y se eliminan del directorio `.next/static`.
- **Sesiones de Stripe**: el handler de checkout crea o reutiliza el `stripeCustomerId` del artista, evitando duplicados de cliente en Stripe por intentos múltiples.

---

## 21. Limitaciones conocidas del sistema actual

**[AÑADIR AL TFG]** Declarar las limitaciones conocidas es señal de madurez técnica e impide que el tribunal las detecte como omisiones. Las siguientes limitaciones son conocidas y están documentadas, no son defectos descubiertos tardíamente:

1. **Feed de actividad en el home del dashboard**: la sección "Actividad reciente" muestra datos ficticios. Requeriría una tabla `ArtworkEvent` (o similar) en el esquema para registrar eventos de publicación, retiro, visitas, etc. Implementar el modelo relacional completo está fuera del alcance del TFG pero la arquitectura lo admite sin cambios disruptivos.

2. **Edición completa de galería**: no existe pantalla de edición de nombre, descripción y todos los campos de configuración de una galería existente. El toggle de visibilidad está disponible en el listado, pero un formulario equivalente al de nueva galería no está implementado.

3. **Una única plantilla de sala**: la galería tiene un selector de plantilla (`white-cube-8`, `long-hall`, `open-room`) visible en el formulario, pero solo `white-cube-8` está implementada. Las otras opciones son seleccionables en la UI pero producen la misma sala porque el viewer solo tiene definida la plantilla del cubo blanco.

4. **Cobertura de tests limitada a capa de dominio**: los tests unitarios cubren servicios y un handler. No existen tests E2E ni tests de componentes React. La recomendación para producción sería al menos un test Playwright con el flujo crítico: registro → crear galería → subir obra → publicar → visitar viewer.

5. **Pipeline Inngest dependiente del servidor de desarrollo**: `npm run dev` no activa automáticamente el servidor Inngest. Si no se ejecuta `npx inngest-cli@latest dev` en paralelo, solo se generan las variantes síncronas (thumbnail y gallery). La variante `detail` (2400 px) requiere Inngest activo o el endpoint `trigger-processing` llamado manualmente.

6. **Avatar de artista sin validación de dimensiones**: la subida de avatar acepta cualquier imagen de hasta 20 MB sin redimensionarla. No hay pipeline Sharp para el avatar; se sirve el original desde R2.

---

*Última actualización: 2026-06-24. Estado del repositorio: branch `master`, commit inicial `a0b465e`. Secciones añadidas en esta revisión: 11.4–11.10 (páginas públicas, catálogos, ManifestoSection 3D, GalleryRoomsCollage, z-fighting). API table ampliada con `/api/galleries/public`, `/api/artists/public` y `/api/stripe/invoices`. Tabla de decisiones ampliada con 7 nuevas filas. Estructura de carpetas corregida: entrada duplicada `artwork/` fusionada; `artworks/[id]/public/` y `stripe/invoices/` añadidos al árbol.*
