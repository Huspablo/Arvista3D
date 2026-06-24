# Guía de prueba manual — Arvista 3D

Flujo completo para verificar que la plataforma funciona de extremo a extremo: registro de artista → galería → obras → publicación → viewer público.

> **Prerrequisito**: servidor corriendo en `http://localhost:3000` (`npm run dev`) y Inngest Dev Server activo (`npx inngest-cli@latest dev`).

---

## Paso 1 — Registro y creación de perfil de artista

### Dónde ocurre
| Acción | Ruta | Servicio |
|---|---|---|
| Registro | `/sign-up` | Clerk (externo) |
| Primer login | `/dashboard` | `requireArtist()` → `artist.service.ts → getOrCreateArtist()` → Neon DB |
| Editar perfil | `/dashboard/profile` | `PATCH /api/artists/me` → `artist.service.ts` → Neon DB |

### Flujo
1. Ve a `http://localhost:3000/sign-up`
2. Regístrate con email o Google. Clerk crea tu identidad (`user_xxxx`).
3. Al llegar al dashboard por primera vez, el sistema llama automáticamente a `getOrCreateArtist(clerkId)`, que crea un registro `Artist` en la BD con plan `BASIC`.
4. Ve a `/dashboard/profile` → rellena nombre y bio → guarda.

### Qué verificar
- **BD (Neon)**: tabla `Artist` tiene una fila con tu `clerkId`, `plan = BASIC`, `name` y `bio` rellenos.
- **Dashboard home** (`/dashboard`): el greeting muestra tu nombre real.
- **Sidebar**: el badge de plan muestra "Básico".

### Dónde se almacena
| Dato | Almacén |
|---|---|
| Identidad (email, password, sesión) | Clerk |
| Perfil artista (nombre, bio, plan) | Neon PostgreSQL — tabla `Artist` |

---

## Paso 2 — Crear una galería

### Dónde ocurre
| Acción | Ruta | Servicio |
|---|---|---|
| Crear galería | `/dashboard/galleries` | `POST /api/galleries` → `gallery.service.ts → createGallery()` → Neon DB |

### Flujo
1. Ve a `/dashboard/galleries` → **Nueva galería**.
2. Rellena nombre (p.ej. "Mi primera galería") y visibilidad **Privada** → crea.

### Lo que hace el sistema internamente
```
POST /api/galleries
  → assertGalleryQuota(artistId, 'BASIC')    # verifica que tienes < 1 galería
  → toSlug("Mi primera galería")             # → "mi-primera-galeria"
  → uniqueSlug(slug)                         # añade sufijo -2 si ya existe
  → db.gallery.create(...)
      + slots: createMany([                  # crea 8 slots en la misma operación
          { position: 0, displayMode: WALL_PLANE  },
          { position: 1, displayMode: WALL_PLANE  },
          { position: 2, displayMode: WALL_PLANE  },
          { position: 3, displayMode: WALL_PLANE  },
          { position: 4, displayMode: WALL_PLANE  },
          { position: 5, displayMode: WALL_PLANE  },
          { position: 6, displayMode: WALL_PLANE  },
          { position: 7, displayMode: FLOOR_MODEL }, # ← solo esculturas
        ])
```

### Qué verificar
- **BD**: tabla `Gallery` tiene 1 fila. Tabla `GallerySlot` tiene 8 filas con `galleryId` correcto y `artworkId = null` en todas.
- **Dashboard**: galería aparece en la lista con visibilidad "Privada".
- **Límite de plan**: intenta crear una segunda galería → debe dar error "GALLERY_LIMIT_REACHED" (plan Básico = 1 galería).

### Dónde se almacena
| Dato | Almacén |
|---|---|
| Metadata de galería (nombre, slug, visibilidad) | Neon — tabla `Gallery` |
| Slots vacíos (posiciones 0–7) | Neon — tabla `GallerySlot` |

---

## Paso 3 — Subir una obra (pintura o fotografía)

### Dónde ocurre
| Paso | Ruta / Servicio | Almacén |
|---|---|---|
| 1. Crear registro de obra (metadata) | `POST /api/artworks` → `artwork.service.ts → createArtwork()` | Neon DB |
| 2. Obtener URL de subida | `POST /api/assets/presigned-url` → R2 | — |
| 3. Subir fichero | Browser → Cloudflare R2 directamente (PUT a URL prefirmada) | R2 |
| 4. Disparar pipeline | `POST /api/artworks/[id]/trigger-processing` → Inngest | Neon + R2 |
| 5. Procesar imagen | Inngest function → Sharp → R2 | R2 |
| 6. Guardar URLs CDN | Inngest → `db.artwork.update(...)` | Neon DB |

### Flujo en la UI
1. `/dashboard/artworks` → **Nueva obra**.
2. Rellena: título, tipo `Pintura`, año (opcional).
3. Selecciona una imagen JPG o PNG.
4. Clic en **Crear obra**.

### Lo que hace el sistema internamente

**A) Crear el registro de obra:**
```
POST /api/artworks  { title, type: "PAINTING", year }
  → db.artwork.create({ status: "DRAFT", artistId, ... })
  → devuelve Artwork con id
```

**B) Obtener URL prefirmada para subir a R2:**
```
POST /api/assets/presigned-url  { artworkId, filename: "foto.jpg", contentType: "image/jpeg" }
  → verifica que la obra pertenece al artista
  → key = "artworks/{artworkId}/original/{timestamp}.jpg"
  → getSignedUrl(r2, PutObjectCommand, { expiresIn: 300 })
  → devuelve { url, key }
```

**C) El browser sube el fichero directamente a R2:**
```
PUT {url prefirmada}
  Body: fichero original
  Headers: Content-Type: image/jpeg
```
> El fichero llega a R2 sin pasar por el servidor Next.js.

**D) Disparar el pipeline de procesamiento:**
```
POST /api/artworks/{id}/trigger-processing  { key, contentType }
  → db.artwork.update({ assetOriginalKey: key })
  → inngest.send({ name: "artwork/uploaded", data: { artworkId, originalKey: key, ... } })
```

**E) Inngest procesa la imagen (asíncrono, en background):**
```
step 1 — download-original
  → r2.GetObject(key)  →  Buffer

step 2 — generate-and-upload-variants
  → Sharp(buffer).resize(400×400, cover).webp(85)   → R2: artworks/{id}/thumbnail.webp
  → Sharp(buffer).resize(1200×900, inside).webp(85) → R2: artworks/{id}/gallery.webp
  → Sharp(buffer).resize(2400×1800, inside).webp(85)→ R2: artworks/{id}/detail.webp

step 3 — update-artwork-assets
  → db.artwork.update({
      assetThumbnail: "https://cdn.r2.dev/artworks/{id}/thumbnail.webp",
      assetGallery:   "https://cdn.r2.dev/artworks/{id}/gallery.webp",
      assetDetail:    "https://cdn.r2.dev/artworks/{id}/detail.webp",
    })

step 4 — invalidate-manifest-cache
  → revalidateTag("manifest-{galleryId}", {})  # solo si ya está expuesta
```

### Qué verificar
- **Inmediatamente** tras crear la obra: en BD `status = DRAFT`, `assetThumbnail = null`.
- **Después de unos segundos** (Inngest): `assetThumbnail`, `assetGallery`, `assetDetail` tienen URLs CDN reales.
- **En R2** (Cloudflare dashboard): carpeta `artworks/{artworkId}/` con `original/`, `thumbnail.webp`, `gallery.webp`, `detail.webp`.
- **En Inngest Dev Server** (`http://localhost:8288`): función `process-artwork-upload` aparece como completada.

### Dónde se almacena
| Dato | Almacén | Campo |
|---|---|---|
| Metadata (título, tipo, año) | Neon — `Artwork` | `title`, `type`, `year` |
| Fichero original | Cloudflare R2 | `artworks/{id}/original/{ts}.jpg` |
| Clave del original | Neon — `Artwork` | `assetOriginalKey` |
| Thumbnail (400px webp) | Cloudflare R2 | `artworks/{id}/thumbnail.webp` |
| URL thumbnail | Neon — `Artwork` | `assetThumbnail` |
| Versión galería (1200px webp) | Cloudflare R2 | `artworks/{id}/gallery.webp` |
| URL galería | Neon — `Artwork` | `assetGallery` |
| Versión detalle (2400px webp) | Cloudflare R2 | `artworks/{id}/detail.webp` |
| URL detalle | Neon — `Artwork` | `assetDetail` |

---

## Paso 4 — Publicar la obra en la galería

### Dónde ocurre
| Acción | Ruta | Servicio |
|---|---|---|
| Exponer obra | `POST /api/artworks/[id]/publish` | `artwork.service.ts → publishArtwork()` → Neon DB |

### Flujo en la UI
1. `/dashboard/artworks` → botón **Exponer** en la obra.
2. Selecciona la galería "Mi primera galería".
3. Confirma.

### Lo que hace el sistema internamente
```
POST /api/artworks/{id}/publish  { galleryId }
  → publishArtwork(artworkId, galleryId, artistId, plan)

  Condición 1: ¿la obra pertenece al artista?
    db.artwork.findFirst({ where: { id, artistId } })  → ✓ o FORBIDDEN

  Condición 2: ¿la galería pertenece al artista?
    db.gallery.findFirst({ where: { id: galleryId, artistId }, include: { slots } })  → ✓ o FORBIDDEN

  Condición 3: ¿la galería no ha alcanzado el límite?
    slots.filter(s => s.artworkId !== null).length < PLAN_LIMITS[BASIC].artworksPerGallery (10)  → ✓ o CAPACITY_REACHED

  Condición 4: ¿hay un slot compatible libre?
    PAINTING → busca slot { displayMode: WALL_PLANE, artworkId: null }
    SCULPTURE → busca slot { displayMode: FLOOR_MODEL, artworkId: null }
    → ✓ o NO_SLOT_AVAILABLE

  Transacción atómica:
    db.$transaction([
      db.artwork.update({ where: { id }, data: { status: "EXPOSED" } }),
      db.gallerySlot.update({ where: { id: freeSlot.id }, data: { artworkId } }),
    ])

  → revalidateTag("manifest-{galleryId}", {})
```

### Qué verificar
- **BD `Artwork`**: `status = EXPOSED`.
- **BD `GallerySlot`**: la fila correspondiente tiene `artworkId` relleno.
- **Dashboard obras**: la obra muestra badge "Expuesta" y botón "Retirar".
- **Capacidad**: el sidebar muestra 1/10 obras expuestas.

### Errores esperados al probar límites
| Situación | Error |
|---|---|
| La obra es de otro artista | `403 FORBIDDEN` |
| La galería es de otro artista | `403 FORBIDDEN` |
| 10 obras ya expuestas (plan Básico) | `403 CAPACITY_REACHED` |
| Quieres exponer escultura pero el slot FLOOR_MODEL está ocupado | `409 NO_SLOT_AVAILABLE` |
| Quieres exponer pintura pero los 7 slots WALL_PLANE están ocupados | `409 NO_SLOT_AVAILABLE` |

---

## Paso 5 — Hacer la galería pública y verla

### Dónde ocurre
| Acción | Ruta | Servicio |
|---|---|---|
| Hacer pública | `/dashboard/galleries` → toggle | `PATCH /api/galleries/[id]` → `gallery.service.ts → updateGallery()` |
| Ver galería | `/galleries/[slug]` | Server Component → `getGalleryBySlug()` → Neon DB |
| Ver viewer 3D | `/galleries/[slug]/viewer` | Server Component → `buildManifest()` → `manifest.service.ts` |

### Flujo
1. `/dashboard/galleries` → toggle visibilidad a **Pública**.
2. Ve a `http://localhost:3000/galleries/mi-primera-galeria` — debe mostrar las obras expuestas.
3. Haz clic en **Entrar a la galería** → viewer 3D en `/galleries/mi-primera-galeria/viewer`.

### Lo que hace el sistema al cargar el viewer
```
GET /galleries/mi-primera-galeria/viewer
  → db.gallery.findUnique({ where: { slug } })   # obtiene galleryId
  → buildManifest(galleryId)
      → unstable_cache(() => _buildManifest(galleryId), [galleryId], { tags: ["manifest-{id}"] })
      → devuelve GalleryManifest:
          {
            gallery: { id, name, templateKey: "white-cube-8", config: { wallColor, floorMaterial, lightingPreset } },
            slots: [
              { id, position: 0, displayMode: "WALL_PLANE", artwork: { id, title, assets: { thumbnail, gallery, detail } } },
              { id, position: 1, displayMode: "WALL_PLANE", artwork: null },  ← slot vacío
              ...
              { id, position: 7, displayMode: "FLOOR_MODEL", artwork: null },
            ]
          }
  → <ViewerClient manifest={manifest} />
```

### Qué verificar
- La galería aparece en `http://localhost:3000/obras` (catálogo público).
- Las obras del viewer cargan las texturas desde URLs CDN de R2 (red de distribución, no del servidor).
- El manifest se puede consultar directamente: `GET /api/galleries/{galleryId}/manifest`.
- **Caché**: modifica la obra (retírala y vuélvela a exponer) → el manifest se regenera.

---

## Paso 6 — Ver la obra en el catálogo público

### Dónde ocurre
| Acción | Ruta | Servicio |
|---|---|---|
| Ver catálogo | `/obras` | Client Component → `GET /api/artworks/public` |
| Ver detalle | `/artworks/[id]` | Server Component → Neon DB directo |
| Incrementar visitas | al visitar el detalle | `GET /api/artworks/[id]/public` → `db.artwork.update({ viewCount: +1 })` |

### Qué verificar
- La obra aparece en `/obras` con thumbnail real.
- Al entrar a `/artworks/{id}`, el campo `viewCount` en BD se incrementa en 1.
- Después de varias visitas, la obra sube en el ranking de la landing (sección "Obras destacadas").

---

## Resumen visual del flujo completo

```
[Clerk]        Registro / Login
    ↓
[Neon DB]      Artist creado automáticamente (plan BASIC)
    ↓
[Neon DB]      Gallery creada + 8 GallerySlots vacíos
    ↓
[Neon DB]      Artwork creado (status: DRAFT)
    ↓
[R2]           Fichero original subido (PUT presigned)
    ↓
[Inngest]      Job disparado → Sharp → 3 webp
    ↓
[R2]           thumbnail.webp / gallery.webp / detail.webp guardados
    ↓
[Neon DB]      Artwork.assetThumbnail / assetGallery / assetDetail actualizados
    ↓
[Neon DB]      publishArtwork → status: EXPOSED + GallerySlot.artworkId asignado
    ↓
[Neon DB]      Gallery.visibility → PUBLIC
    ↓
[Viewer]       buildManifest() → unstable_cache → JSON semántico → R3F renderiza
    ↓
[Neon DB]      viewCount++ al visitar /artworks/[id]
    ↓
[Landing]      Obra aparece en "Obras destacadas" (ordenadas por viewCount)
```

---

## Checklist rápido de verificación

- [ ] Registro → `Artist` en BD con `plan = BASIC`
- [ ] Perfil → nombre visible en dashboard greeting
- [ ] Galería → 1 fila en `Gallery` + 8 filas en `GallerySlot`
- [ ] Intentar segunda galería → error 403 `GALLERY_LIMIT_REACHED`
- [ ] Obra creada → `status = DRAFT`, assets `null`
- [ ] Inngest completa el job → assets con URLs CDN reales en BD
- [ ] R2 tiene carpeta `artworks/{id}/` con 4 ficheros
- [ ] Obra expuesta → `status = EXPOSED`, slot asignado
- [ ] Galería pública → visible en `/obras` y `/galleries/[slug]`
- [ ] Viewer carga las texturas desde CDN (verificar en Network tab del browser)
- [ ] `viewCount` sube al visitar `/artworks/[id]`
- [ ] `GET /api/galleries/{galleryId}/manifest` devuelve JSON válido

---

## Herramientas útiles durante la prueba

| Herramienta | URL | Para qué |
|---|---|---|
| Inngest Dev Server | `http://localhost:8288` | Ver jobs, pasos, errores del pipeline de imagen |
| Neon Console | `console.neon.tech` | Inspeccionar tablas Artist, Gallery, GallerySlot, Artwork |
| Cloudflare R2 | `dash.cloudflare.com` | Ver ficheros en el bucket `arvista-assets` |
| Sentry | `sentry.io` | Errores capturados en producción / local |
| Prisma Studio | `npm run db:studio` | GUI local para explorar la BD |
