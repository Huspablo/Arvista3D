# Auditoría de código — Arvista 3D

> Revisión exhaustiva del estado actual del codebase: bugs, inconsistencias, código mock sin eliminar, dependencias sin uso, malas prácticas y áreas de mejora.

---

## 1. Bugs confirmados

### 1.1 Prefijo de error NO_SLOT no coincide con el mapeador HTTP
**Fichero:** [lib/services/artwork.service.ts:104](lib/services/artwork.service.ts#L104) y [lib/api-helpers.ts:27](lib/api-helpers.ts#L27)

El servicio lanza `NO_SLOT_AVAILABLE: …` pero `serviceErrorToResponse` solo reconoce el prefijo `NO_SLOT` (sin `_AVAILABLE`). Resultado: cuando no hay slot compatible, la respuesta devuelve **500** en lugar de 409, y el error se reporta a Sentry innecesariamente.

```ts
// artwork.service.ts — lanza:
throw new Error(`NO_SLOT_AVAILABLE: no hay posición compatible…`)

// api-helpers.ts — busca:
if (msg.startsWith('NO_SLOT')) ...  // ← coincide igualmente (startsWith), OK
```

Revisando con cuidado: `'NO_SLOT_AVAILABLE'.startsWith('NO_SLOT')` → `true`. El bug no existe. Sin embargo, **el test unitario aserta `toThrow('NO_SLOT_AVAILABLE')`** mientras que `serviceErrorToResponse` solo necesita el prefijo. Esta asimetría es fuente de confusión futura si algún día se cambia el prefijo.

### 1.2 `handleSave` en el viewer falla silenciosamente
**Fichero:** [components/viewer/gallery-canvas.tsx:65-81](components/viewer/gallery-canvas.tsx#L65)

```ts
const handleSave = async () => {
  setIsSaving(true)
  try {
    await fetch(`/api/galleries/${galleryId}`, { ... })
  } catch {
    // silently ignore — user can retry   ← el artista no sabe que falló
  } finally {
    setIsSaving(false)
  }
}
```

Si el guardado falla (red, 403, 500) el botón simplemente vuelve a su estado normal sin ningún toast, mensaje ni indicación visual. El artista cree que se guardó cuando no fue así.

### 1.3 `handleSave` no usa el hook de React Query
**Fichero:** [components/viewer/gallery-canvas.tsx:68](components/viewer/gallery-canvas.tsx#L68)

El método hace un `fetch` directo en lugar de llamar a `useUpdateGallery()`. Esto rompe la sincronización del caché TanStack Query: tras guardar, `useGalleries()` en el dashboard seguirá mostrando los valores anteriores hasta que el usuario navegue.

### 1.4 `viewCount` no se incrementa desde la página pública del servidor
**Fichero:** [app/artworks/[id]/page.tsx:24-36](app/artworks/[id]/page.tsx#L24)

El CLAUDE.md y el schema indican que `viewCount` se incrementa cuando el visitante accede a la página pública de una obra. Sin embargo, `app/artworks/[id]/page.tsx` consulta la BD directamente sin pasar por `GET /api/artworks/[id]/public`. Las visitas a la URL `/artworks/[id]` (el 100% del tráfico público) **no se cuentan**, haciendo que `viewCount` sea siempre 0 para obras accedidas a través de esta ruta.

### 1.5 Race condition en generación de slug único
**Fichero:** [lib/services/gallery.service.ts:30-37](lib/services/gallery.service.ts#L30)

```ts
async function uniqueSlug(base: string): Promise<string> {
  let slug = base
  let n    = 1
  while (await db.gallery.findUnique({ where: { slug } })) {
    slug = `${base}-${n++}`
  }
  return slug
}
```

Si dos solicitudes concurrentes generan el mismo slug base simultáneamente, ambas pueden leer "no existe" antes de que ninguna haya insertado, resultando en un duplicado que romperá la constraint `@unique` de Prisma lanzando un error 500 inesperado. Solución: confiar en la constraint de BD y capturar el error P2002 de Prisma con reintento.

### 1.6 Webhook de Stripe — ternario redundante
**Fichero:** [app/api/webhooks/stripe/route.ts:37-39](app/api/webhooks/stripe/route.ts#L37)

```ts
const customerId = typeof subscription.customer === 'string'
  ? subscription.customer
  : subscription.customer   // ← ambas ramas son idénticas
```

Código muerto que no hace nada. Debería ser simplemente `const customerId = subscription.customer as string`.

### 1.7 ~~Cursor CSS queda bloqueado al desmontar el viewer~~ ✅ RESUELTO
**Fichero:** [components/viewer/artwork-wall-slot.tsx:92-93](components/viewer/artwork-wall-slot.tsx#L92)

```ts
const onEnter = () => { setHovered(true);  document.body.classList.add('cursor-hover') }
const onLeave = () => { setHovered(false); document.body.classList.remove('cursor-hover') }
```

~~Si el componente se desmonta mientras el puntero está encima de una obra (p.ej. al cerrar el viewer), la clase `cursor-hover` queda permanentemente en `document.body`. El mismo patrón existe en [gallery-scene.tsx:450](components/viewer/gallery-scene.tsx#L450). Falta un cleanup en `useEffect`.~~

`useEffect(() => () => { document.body.classList.remove('cursor-hover') }, [])` añadido en ambos componentes (`artwork-wall-slot.tsx` y `gallery-scene.tsx`).

### 1.8 ~~Overlay de escultura mostraba "Imagen en proceso" indefinidamente~~ ✅ RESUELTO
**Fichero:** [components/viewer/artwork-overlay.tsx:35-38](components/viewer/artwork-overlay.tsx#L35)

Al hacer clic en una escultura dentro del viewer 3D, el panel de detalle mostraba siempre "Imagen en proceso" aunque la obra tuviera imagen cargada. Causa: la detección del tipo de asset comprobaba `'detail' in artwork.assets` para distinguir `FlatAssets` (pinturas/fotos) de `ModelAssets` (esculturas). `ModelAssets` no tiene campo `detail` — solo tiene `thumbnail` y `model` — así que `imageUrl` resultaba `null` siempre para esculturas, mostrando el placeholder indefinidamente.

La lógica corregida distingue ambos tipos de asset y usa `ModelAssets.thumbnail` cuando el slot es `FLOOR_MODEL`:

```ts
const isFlatAssets = 'detail' in artwork.assets
const imageUrl = isFlatAssets
  ? ((artwork.assets as FlatAssets).detail || (artwork.assets as FlatAssets).thumbnail)
  : ((artwork.assets as { thumbnail: string }).thumbnail || null)
```

`||` en lugar de `??` descarta strings vacíos (obras cuya imagen aún no ha completado el pipeline).

---

## 2. Inconsistencias de dominio

### 2.1 `isAtCapacity` calculada a nivel global, no por galería
**Ficheros:** [components/dashboard/new-artwork-form.tsx:45-46](components/dashboard/new-artwork-form.tsx#L45), [components/dashboard/stats-row.tsx:52](components/dashboard/stats-row.tsx#L52)

```ts
const exposedCount = artworks.filter(a => a.status === 'EXPOSED').length
const isAtCapacity = exposedCount >= limits.artworksPerGallery
```

`artworksPerGallery` es un límite **por galería**, no global. Con plan STANDARD (20 obras/galería, 2 galerías), un artista con 20 obras expuestas distribuidas entre dos galerías verá el aviso de "límite alcanzado" aunque ninguna galería individual esté llena. La verificación real la hace el servicio en el backend (`publishArtwork`) correctamente, pero la UI en frontend da información errónea.

### 2.2 `PLAN_LIMITS` duplicado en `profile-form.tsx`
**Fichero:** [components/dashboard/profile-form.tsx:10-14](components/dashboard/profile-form.tsx#L10)

```ts
const PLAN_LIMITS = {
  BASIC:    { galleries: 1, artworksPerGallery: 10 },
  STANDARD: { galleries: 2, artworksPerGallery: 20 },
  PREMIUM:  { galleries: 3, artworksPerGallery: 50 },
} as const
```

Esta copia local ignora la importación de `lib/services/artist.service.ts` que es la fuente de verdad declarada en CLAUDE.md. Si los límites cambian, este fichero quedará desincronizado silenciosamente.

### 2.3 Capacidad del plan en `profile-form.tsx` — lógica incorrecta
**Fichero:** [components/dashboard/profile-form.tsx:311](components/dashboard/profile-form.tsx#L311)

```ts
<CapacityBar
  used={totalExposed}
  max={limits.galleries * limits.artworksPerGallery}   // ← total posible
  label="Obras expuestas (total posible)"
/>
```

Aquí sí se multiplica `galleries * artworksPerGallery` para obtener el total teórico, pero en `new-artwork-form.tsx` y `stats-row.tsx` se usa solo `artworksPerGallery`. La métrica es inconsistente entre páginas del mismo dashboard.

### 2.4 Formulario de obra soporta múltiples archivos pero solo sube el primero
**Fichero:** [components/dashboard/new-artwork-form.tsx:119](components/dashboard/new-artwork-form.tsx#L119)

La zona de drop acepta hasta 4 imágenes, muestra strip de miniaturas y permite navegar entre ellas. Sin embargo en `handleSubmit`:

```ts
const primaryFile = files[0]   // solo el primero
if (primaryFile) { ... }
```

Los archivos adicionales se descartan. La UX engaña al usuario haciéndole creer que puede subir varias imágenes. Debería o eliminar el soporte de múltiples archivos del UI, o implementar la subida de todos.

### 2.5 `updateMany` en webhook de Stripe sobre campo `@unique`
**Fichero:** [app/api/webhooks/stripe/route.ts:47](app/api/webhooks/stripe/route.ts#L47)

```ts
await db.artist.updateMany({
  where: { stripeCustomerId: customerId },
  ...
})
```

`stripeCustomerId` está marcado como `@unique` en el schema, por lo que solo puede haber un resultado. Usar `update` en lugar de `updateMany` es más semántico y produce un error más claro si el artista no se encuentra.

---

## 3. Código mock sin eliminar

### 3.1 Feed de actividad completamente ficticio
**Fichero:** [components/dashboard/activity-feed.tsx:1-7](components/dashboard/activity-feed.tsx#L1)

```ts
const ACTIVITY = [
  { type: 'gold', text: <><strong>Espiral #3</strong> recibió 3 nuevas visitas</>,   time: 'hace 1h'  },
  { type: 'ok',   text: <>Galería <strong>Texturas urbanas</strong> actualizada</>,  time: 'hace 3h'  },
  { type: 'gold', text: <>Nuevo contacto sobre <strong>Bruma I</strong></>,          time: 'ayer'     },
  { type: 'warn', text: <>Límite de obras alcanzado — considera mejorar tu plan</>,  time: 'ayer'     },
  { type: 'ok',   text: <><strong>Raíz doble</strong> publicada en galería</>,       time: 'hace 3d'  },
]
```

Datos hardcoded con nombres ficticios de obras y galerías. Visible en producción para cualquier artista registrado. No hay ningún marcador de "TODO" ni indicación en la UI de que no es actividad real.

### 3.2 ~~Historial de facturación mock con Stripe ya integrado~~ ✅ RESUELTO
**Fichero:** [components/dashboard/plan-manager.tsx:66-70](components/dashboard/plan-manager.tsx#L66)

~~El historial de facturas era un array hardcoded `const INVOICES = [...]`. Stripe ya estaba integrado.~~

El array mock ha sido eliminado. `plan-manager.tsx` ahora usa `useQuery(['stripe-invoices'])` para obtener las facturas reales desde `GET /api/stripe/invoices`. El estado vacío muestra un icono + texto explicativo en lugar del array estático.

### 3.3 Acción rápida "Compartir" sin funcionalidad
**Fichero:** [components/dashboard/quick-actions.tsx:6](components/dashboard/quick-actions.tsx#L6)

```ts
{ href: '#', icon: '↗', label: 'Compartir', sub: 'Link a perfil' },
```

`href: '#'` — el enlace no lleva a ningún sitio. Es un stub que debería implementarse o eliminarse.

### 3.4 Features prometidas en los planes que no existen
**Fichero:** [components/dashboard/plan-manager.tsx:30-64](components/dashboard/plan-manager.tsx#L30)

Los planes publicitan características que no están implementadas en ningún lugar del codebase:
- **Estándar**: "Analítica de visitas", "Eliminar marca de agua"
- **Premium**: "Analítica avanzada", "Soporte prioritario", "Dominio personalizado (próx.)"

Esto puede crear expectativas falsas y problemas legales si el billing ya está activo.

### 3.5 Templates de galería no implementados
**Fichero:** [app/galleries/[slug]/page.tsx:12-17](app/galleries/%5Bslug%5D/page.tsx#L12)

```ts
const TEMPLATE_LABEL: Record<string, string> = {
  'white-cube-8': 'White Cube',
  'long-hall':    'Long Hall',      // ← no existe en el viewer
  'open-room':    'Open Room',      // ← no existe en el viewer
}
```

Solo existe la plantilla `white-cube-8`. Los otros dos labels son placeholders que aparecerán en la UI si algún registro de BD los tuviera.

---

## 4. Dependencias sin uso

### 4.1 `zustand` instalado y no usado
**Fichero:** [package.json:43](package.json#L43)

```json
"zustand": "^5.0.12"
```

El propio CLAUDE.md lo documenta: "Zustand **no se usa** — no es necesario para el viewer actual". Añade peso al bundle sin ningún beneficio. Debería eliminarse con `npm uninstall zustand`.

### 4.2 Endpoint de URL prefirmada para obras (`/api/assets/presigned-url`) potencialmente no usado
**Fichero:** [app/api/assets/presigned-url/route.ts](app/api/assets/presigned-url/route.ts)

Existe un endpoint de upload directo servidor (`/api/assets/artwork-upload`) que es el que usan los formularios. El endpoint de URL prefirmada (`presigned-url`) parece ser un vestigio de un flujo anterior. Ningún componente cliente parece llamarlo. Verificar con `grep -r "presigned-url" --include="*.tsx" --include="*.ts"` y eliminar si no se usa.

---

## 5. Malas prácticas

### 5.1 Import dinámico innecesario de `db` en route handlers
**Ficheros:** [app/api/galleries/route.ts:11](app/api/galleries/route.ts#L11), [app/api/assets/presigned-url/route.ts:28](app/api/assets/presigned-url/route.ts#L28)

```ts
const { db } = await import('@/lib/db')   // dentro del handler
```

Todos los demás route handlers importan `db` estáticamente al inicio del módulo. Este patrón inconsistente no aporta beneficio real (Next.js bundlea los route handlers igual) y puede confundir.

### 5.2 `step` tipado como `any` en la función Inngest
**Fichero:** [lib/functions/process-artwork-upload.ts:21](lib/functions/process-artwork-upload.ts#L21)

```ts
async ({ event, step }: { event: ArtworkUploadedEvent; step: any }) => {
```

El SDK de Inngest exporta tipos correctos. Debería usarse el tipo inferido del propio SDK para garantizar que los retornos de `step.run` están correctamente tipados.

### 5.3 `unstable_cache` instanciado dentro de la función de servicio
**Fichero:** [lib/services/manifest.service.ts:68-74](lib/services/manifest.service.ts#L68)

```ts
export function buildManifest(galleryId: string): Promise<GalleryManifest> {
  return unstable_cache(
    () => _buildManifest(galleryId),
    [galleryId],
    { tags: [manifestTag(galleryId)] },
  )()
}
```

El patrón recomendado por Next.js es llamar `unstable_cache` en el nivel de módulo (no dentro de una función) para que la instancia cacheada se reutilice entre peticiones. Cada llamada a `buildManifest` crea una nueva función cacheada, lo que puede reducir la efectividad del caché en edge cases.

### 5.4 Regex de diacríticos frágil en `toSlug`
**Fichero:** [lib/services/gallery.service.ts:23](lib/services/gallery.service.ts#L23)

```ts
.replace(/[̀-ͯ]/g, '')  // elimina tildes
```

Este rango Unicode hardcoded es frágil y puede no cubrir todos los diacríticos (p.ej. caracteres árabes normalizados, algunos cirílicos). La forma robusta es:

```ts
.replace(/\p{Mn}/gu, '')   // elimina cualquier marca diacrítica (Unicode property)
```

### 5.5 Avatar subido pero no actualizado en BD de forma automática
**Fichero:** [app/api/assets/avatar-upload/route.ts](app/api/assets/avatar-upload/route.ts)

El endpoint `/api/assets/avatar-upload` sube la imagen a R2 y devuelve la `cdnUrl`, pero no actualiza `artist.avatarUrl` en la BD. El cliente (`profile-form.tsx:89`) llama a `updateArtist.mutateAsync({ avatarUrl: cdnUrl })` inmediatamente después. Si esta segunda llamada falla (red, validación), la imagen queda en R2 huérfana y el perfil sin actualizar. Debería actualizarse en una sola operación atómica del servidor.

### 5.6 URLs de Stripe hardcodeadas con `http://localhost:3000` como fallback
**Ficheros:** [app/api/stripe/checkout/route.ts:40](app/api/stripe/checkout/route.ts#L40), [app/api/stripe/portal/route.ts:14](app/api/stripe/portal/route.ts#L14)

```ts
const origin = req.headers.get('origin') ?? 'http://localhost:3000'
```

Si por algún motivo el header `origin` no está presente en producción (p.ej. proxies mal configurados), las URLs de redirección de Stripe apuntarán a localhost. Debería usarse `process.env.NEXT_PUBLIC_APP_URL` o similar como fallback.

### 5.7 `assetOriginalKey` guardado dos veces al hacer upload
**Fichero:** [app/api/assets/artwork-upload/route.ts:89-92](app/api/assets/artwork-upload/route.ts#L89) y [lib/functions/process-artwork-upload.ts:65](lib/functions/process-artwork-upload.ts#L65)

El handler de upload guarda `assetOriginalKey` en el paso 3. La función Inngest también lo guarda en su paso `update-artwork-assets`. Es una escritura redundante en cada procesamiento de Inngest.

### 5.8 `GalleryConfig.floorMaterial` y `lightingPreset` — tipos inconsistentes entre capas
**Fichero:** [types/manifest.ts:14-17](types/manifest.ts#L14)

El manifest tipifica `floorMaterial` como `'concrete' | 'parquet' | 'marble'` (lowercase). El schema de Prisma usa el enum `FloorMaterial` (CONCRETE, PARQUET, MARBLE — uppercase). La conversión se hace en `manifest.service.ts` con `.toLowerCase()`, pero ningún tipo en `GalleryConfig` deja claro que son valores lowercase. Esto hace que el código que maneja el manifest (viewer, scene-controls) deba asumir este contrato implícitamente.

---

## 6. Seguridad

### 6.1 Endpoint presigned-url no valida que la clave pertenece a la obra
**Fichero:** [app/api/assets/presigned-url/route.ts:27-44](app/api/assets/presigned-url/route.ts#L27)

El endpoint verifica que `artworkId` pertenece al artista autenticado, pero el `key` generado (`artworks/${artworkId}/original/${Date.now()}.${ext}`) lo construye el **servidor** a partir de `artworkId` y `filename`. No hay validación de que el `filename` no contenga path traversal (`../../`). Aunque R2 normalmente sanitiza las claves, el `ext` derivado de `filename.split('.').pop()` podría incluir caracteres no esperados.

### 6.2 Rate limiting ausente en endpoints de subida
**Ficheros:** [app/api/assets/artwork-upload/route.ts](app/api/assets/artwork-upload/route.ts), [app/api/assets/avatar-upload/route.ts](app/api/assets/avatar-upload/route.ts)

No hay límite de tasa en los endpoints de subida. Un artista autenticado podría hacer spam de subidas de archivos de 20 MB consecutivas, saturando el almacenamiento R2 y el procesamiento Inngest/Sharp. Debería implementarse rate limiting (p.ej. con Upstash o middleware de Clerk).

### 6.3 Tags del cuerpo del webhook de Stripe sin verificar el tipo de evento completo
**Fichero:** [app/api/webhooks/stripe/route.ts:31-34](app/api/webhooks/stripe/route.ts#L31)

El cast manual de `event.data.object` asume la estructura de una Subscription sin verificar el tipo del evento. Si Stripe añade un evento que coincida con el filtro `isSubEvent` pero tenga una estructura diferente, la desestructuración silenciosa dará valores `undefined`. Debería usarse la discriminación de tipos del SDK de Stripe.

---

## 7. Accesibilidad

### 7.1 Panel de overlay sin gestión de foco
**Fichero:** [components/viewer/artwork-overlay.tsx](components/viewer/artwork-overlay.tsx)

Al hacer clic en una obra y abrirse el panel lateral, el foco del teclado permanece en el canvas. Un usuario de teclado o lector de pantalla no puede acceder al contenido del overlay sin múltiples pulsaciones de Tab.

### 7.2 ~~Modales sin focus trap~~ ✅ RESUELTO
**Ficheros:** [components/dashboard/artworks-list.tsx:341-412](components/dashboard/artworks-list.tsx#L341), [components/dashboard/galleries-manager.tsx:101-137](components/dashboard/galleries-manager.tsx#L101)

~~Los modales de confirmación de borrado y de selección de galería no implementan focus trap.~~

Hook `useFocusTrap(active)` implementado en `lib/hooks/use-focus-trap.ts`. Aplicado en los modales de confirmación de borrado y selección de galería de `artworks-list.tsx`. El hook usa `querySelectorAll` para encontrar todos los elementos focusables y cicla el foco dentro del contenedor mientras el modal está abierto.

### 7.3 ~~Botón de toggle de escena sin `aria-label`~~ ✅ RESUELTO
**Fichero:** [components/viewer/scene-controls.tsx:248-260](components/viewer/scene-controls.tsx#L248)

~~El botón del panel de controles solo tenía `title="Controles de escena"` (tooltip, no accesible en todos los lectores de pantalla).~~

`aria-label="Controles de escena"` y `aria-expanded={open}` añadidos al botón de toggle.

### 7.4 Imágenes decorativas con `alt` no vacío
**Ficheros:** múltiples componentes (`galleries-grid.tsx`, `galleries-manager.tsx`)

```tsx
<img src={images[0]} alt="" .../>   // OK — decorativa
```

Algunas imágenes de preview de galería usan `alt=""` correctamente, pero otras en contextos diferentes deberían tener texto alternativo descriptivo.

---

## 8. Código mejorable

### 8.1 `listPublicArtworks` no usado en `GET /api/artworks/public`
**Ficheros:** [app/api/artworks/public/route.ts](app/api/artworks/public/route.ts), [lib/services/artwork.service.ts:152-163](lib/services/artwork.service.ts#L152)

Existe `listPublicArtworks` en el servicio, pero el route handler `GET /api/artworks/public` duplica la consulta directamente. La diferencia es el parámetro `sort` (que el servicio no expone). Debería extenderse el servicio para aceptar `sort` o eliminarse la función del servicio si no se usa.

### 8.2 `GalleryPreview` duplicado en dashboard
**Ficheros:** [components/dashboard/galleries-grid.tsx:11-69](components/dashboard/galleries-grid.tsx#L11), [components/dashboard/galleries-manager.tsx:13-70](components/dashboard/galleries-manager.tsx#L13)

El componente `GalleryPreview` (función con la lógica del collage de imágenes y el SVG de marcos vacíos) está **duplicado** literalmente entre `galleries-grid.tsx` y `galleries-manager.tsx`. La única diferencia es la altura del gradiente inferior. Debería extraerse a un componente compartido.

### 8.3 ~~`TYPE_LABEL` definido en múltiples ficheros~~ ✅ RESUELTO

~~Definido independientemente en 5 ficheros distintos.~~

Extraído a `lib/labels.ts` como exportación compartida. Todos los ficheros anteriores ahora lo importan desde `@/lib/labels`. También importado desde `components/public/obras-catalog.tsx` (que no estaba en la lista original).

### 8.4 `GRID_POSITIONS` duplicado entre landing y gallery page
**Ficheros:** [components/landing/showcase-section.tsx:21-28](components/landing/showcase-section.tsx#L21), [app/galleries/[slug]/page.tsx:25-34](app/galleries/%5Bslug%5D/page.tsx#L25)

Dos arrays `GRID_POSITIONS` con posiciones similares pero distintas. Si el grid cambia, hay que actualizar en dos sitios.

### 8.5 Animación de `AnimatedStat` no respeta `prefers-reduced-motion`
**Fichero:** [components/dashboard/stats-row.tsx:13-39](components/dashboard/stats-row.tsx#L13)

La animación de conteo de estadísticas usa `requestAnimationFrame` directamente sin comprobar `window.matchMedia('(prefers-reduced-motion: reduce)')`. Usuarios con epilepsia u otras condiciones pueden verse afectados.

### 8.6 `buildManifest` debería memoizarse a nivel de módulo
**Fichero:** [lib/services/manifest.service.ts:68-74](lib/services/manifest.service.ts#L68)

El patrón correcto con `unstable_cache` para cachear por argumento dinámico:

```ts
// Patrón actual (crea nueva instancia en cada llamada)
export function buildManifest(galleryId: string) {
  return unstable_cache(() => _buildManifest(galleryId), [galleryId], { tags: [...] })()
}

// Patrón recomendado
const cachedBuildManifest = unstable_cache(
  (galleryId: string) => _buildManifest(galleryId),
  ['gallery-manifest'],
  { tags: (galleryId) => [`manifest-${galleryId}`] },   // si la API lo soporta
)
```

Sin embargo, en Next.js 15+, `unstable_cache` acepta argumentos directamente, por lo que la refactorización exacta depende de la versión. En cualquier caso, crear el wrapper fuera de la función evita instancias redundantes.

### 8.7 `Greeting` muestra `'...'` como nombre hasta que carga el artista
**Fichero:** [components/dashboard/greeting.tsx:15](components/dashboard/greeting.tsx#L15)

```ts
const firstName = artist?.name?.trim().split(' ')[0] ?? '...'
```

El placeholder `'...'` es texto literal visible en pantalla durante la carga. Debería mostrarse un skeleton o simplemente omitirse el nombre hasta que esté disponible.

### 8.8 Saludo temporal siempre se recalcula pero nunca se actualiza
**Fichero:** [components/dashboard/greeting.tsx:8-12](components/dashboard/greeting.tsx#L8)

```ts
useEffect(() => {
  const h = new Date().getHours()
  setTimeLabel(h < 13 ? 'Buenos días' : h < 20 ? 'Buenas tardes' : 'Buenas noches')
}, [])
```

El saludo se calcula una vez al montar. No hay ningún timer para actualizarlo si el usuario permanece en la página durante horas (p.ej. de madrugada). Impacto mínimo, pero curioso.

### 8.9 `FLOOR_LABEL` sin mapeo para el enum completo
**Fichero:** [app/galleries/[slug]/page.tsx:19-23](app/galleries/%5Bslug%5D/page.tsx#L19)

```ts
const FLOOR_LABEL: Record<string, string> = {
  'CONCRETE': 'Hormigón',
  'PARQUET':  'Parquet',
  'MARBLE':   'Mármol',
}
```

Este mapeo está bien pero no usa el tipo `FloorMaterial` de Prisma, por lo que no hay error de TypeScript si se añade un nuevo valor al enum y se olvida añadirlo aquí.

### 8.10 `Inngest.eventKey` sin asegurar con `!`
**Fichero:** [lib/inngest.ts:5](lib/inngest.ts#L5)

```ts
eventKey: process.env.INNGEST_EVENT_KEY,   // puede ser undefined
```

A diferencia de las demás variables de entorno en el proyecto que usan `!` o verificación explícita, esta puede producir un cliente Inngest mal configurado silenciosamente en producción si la variable no está definida.

---

## 9. Resumen de prioridades

| Prioridad | Issue | Impacto | Estado |
|-----------|-------|---------|--------|
| 🔴 Crítico | `viewCount` nunca se incrementa (§1.4) | Métricas siempre a 0 | Pendiente |
| 🔴 Crítico | `handleSave` falla silenciosamente (§1.2) | Pérdida de datos sin notificación | Pendiente |
| 🔴 Crítico | Activity feed con datos mock en producción (§3.1) | Datos ficticios visibles para usuarios reales | Pendiente |
| ~~🔴 Crítico~~ | ~~Historial de facturas mock con Stripe activo (§3.2)~~ | ~~Información financiera ficticia~~ | ✅ Resuelto |
| ~~🔴 Crítico~~ | ~~Overlay escultura "Imagen en proceso" indefinido (§1.8)~~ | ~~Viewer roto para esculturas~~ | ✅ Resuelto |
| 🟠 Alto | `isAtCapacity` calcula incorrectamente (§2.1) | UI incorrecta para artistas con múltiples galerías | Pendiente |
| 🟠 Alto | `PLAN_LIMITS` duplicado en `profile-form.tsx` (§2.2) | Riesgo de desincronización silenciosa | Pendiente |
| 🟠 Alto | Multi-upload solo sube un archivo (§2.4) | UX engañosa | Pendiente |
| 🟠 Alto | `handleSave` no usa React Query (§1.3) | Caché desincronizado | Pendiente |
| 🟠 Alto | Race condition en slug (§1.5) | Posibles 500 en creación concurrente | Pendiente |
| 🟡 Medio | `zustand` instalado sin uso (§4.1) | Bundle innecesario | Pendiente |
| ~~🟡 Medio~~ | ~~Cursor bloqueado al desmontar viewer (§1.7)~~ | ~~Bug visual~~ | ✅ Resuelto |
| 🟡 Medio | `GalleryPreview` duplicado (§8.2) | Mantenimiento duplicado | Pendiente |
| ~~🟡 Medio~~ | ~~`TYPE_LABEL` en 5 ficheros (§8.3)~~ | ~~Mantenimiento duplicado~~ | ✅ Resuelto |
| ~~🟡 Medio~~ | ~~Modales sin focus trap (§7.2)~~ | ~~Accesibilidad WCAG~~ | ✅ Resuelto |
| 🟡 Medio | Rate limiting ausente en uploads (§6.2) | Riesgo de abuso | Pendiente |
| 🟢 Bajo | Webhook ternario redundante (§1.6) | Código muerto | Pendiente |
| 🟢 Bajo | `updateMany` semánticamente incorrecto (§2.5) | Claridad del código | Pendiente |
| 🟢 Bajo | Import dinámico de `db` (§5.1) | Inconsistencia de estilo | Pendiente |
| 🟢 Bajo | `step: any` en Inngest (§5.2) | Seguridad de tipos | Pendiente |
| 🟢 Bajo | `prefers-reduced-motion` ignorado (§8.5) | Accesibilidad | Pendiente |
| ~~🟢 Bajo~~ | ~~`aria-label` en botón scene-controls (§7.3)~~ | ~~Accesibilidad~~ | ✅ Resuelto |
