# Gallery Manifest

Contrato entre el backend y el viewer 3D.

El backend genera el manifest bajo demanda a partir del estado actual de la base de datos. No se almacena: se computa y se puede cachear. El viewer no consulta la base de datos directamente ni infiere nada desde los tipos de obra; todo lo que necesita para renderizar está en el manifest.

---

## TypeScript types

```typescript
// Contrato completo del manifest que el backend entrega al viewer

export type GalleryManifest = {
  gallery: GalleryMeta
  slots:   SlotManifest[]
}

export type GalleryMeta = {
  id:          string
  name:        string
  templateKey: string       // clave de plantilla 3D predefinida
  config:      GalleryConfig
}

export type GalleryConfig = {
  wallColor?:       string  // hex, ej: "#f5f5f5"
  floorMaterial?:   string  // preset: "concrete" | "parquet" | "marble"
  lightingPreset?:  string  // preset: "warm" | "neutral" | "dramatic"
}

export type SlotManifest = {
  id:          string
  position:    number       // índice dentro de la plantilla
  displayMode: DisplayMode  // determina cómo el viewer renderiza este slot
  artwork:     ArtworkManifest | null  // null = slot vacío, se renderiza como espacio libre
}

export type DisplayMode = "WALL_PLANE" | "FLOOR_MODEL"

export type ArtworkManifest = {
  id:          string
  title:       string
  artistName:  string
  type:        ArtworkType
  year?:       number
  tags:        string[]
  dimensions?: Dimensions   // en cm
  assets:      FlatAssets | ModelAssets  // discriminado por displayMode del slot
}

export type ArtworkType = "PAINTING" | "SCULPTURE" | "PHOTOGRAPHY" | "OTHER"

export type Dimensions = {
  width:   number
  height:  number
  depth?:  number
}

// Obras planas (WALL_PLANE): pintura, fotografía
export type FlatAssets = {
  thumbnail: string  // URL CDN — vista previa en sidebar y mapa de sala
  gallery:   string  // URL CDN — textura renderizada sobre el plano en la pared
  detail:    string  // URL CDN — imagen de alta resolución para el panel de detalle
}

// Obras volumétricas (FLOOR_MODEL): escultura
export type ModelAssets = {
  model:     string  // URL CDN — archivo .glb
  thumbnail: string  // URL CDN — vista previa en sidebar y mapa de sala
}
```

---

## Reglas de generación

1. El manifest solo incluye slots definidos por la plantilla de la galería.
2. Un slot con `artwork: null` es un slot libre — el viewer lo renderiza como espacio vacío.
3. Los `assets` de cada obra son URLs CDN ya resueltas, nunca claves R2 crudas.
4. El `displayMode` del slot determina qué tipo de assets se esperan; el viewer no lo deduce desde `type`.
5. El manifest no incluye datos privados del artista ni claves internas de storage.

---

## Ejemplo

```json
{
  "gallery": {
    "id": "clx1a2b3c",
    "name": "Formas y luz",
    "templateKey": "modern-white-cube",
    "config": {
      "wallColor": "#f0ede8",
      "floorMaterial": "concrete",
      "lightingPreset": "warm"
    }
  },
  "slots": [
    {
      "id": "slot_01",
      "position": 0,
      "displayMode": "WALL_PLANE",
      "artwork": {
        "id": "art_01",
        "title": "Estudio en azul",
        "artistName": "Clara Vidal",
        "type": "PAINTING",
        "year": 2022,
        "tags": ["abstracto", "acrílico"],
        "dimensions": { "width": 120, "height": 90 },
        "assets": {
          "thumbnail": "https://cdn.arvista.art/artworks/art_01/thumb.webp",
          "gallery":   "https://cdn.arvista.art/artworks/art_01/gallery.webp",
          "detail":    "https://cdn.arvista.art/artworks/art_01/detail.webp"
        }
      }
    },
    {
      "id": "slot_02",
      "position": 1,
      "displayMode": "FLOOR_MODEL",
      "artwork": {
        "id": "art_02",
        "title": "Tensión I",
        "artistName": "Clara Vidal",
        "type": "SCULPTURE",
        "year": 2023,
        "tags": ["bronce", "minimalismo"],
        "dimensions": { "width": 30, "height": 80, "depth": 30 },
        "assets": {
          "model":     "https://cdn.arvista.art/artworks/art_02/model.glb",
          "thumbnail": "https://cdn.arvista.art/artworks/art_02/thumb.webp"
        }
      }
    },
    {
      "id": "slot_03",
      "position": 2,
      "displayMode": "WALL_PLANE",
      "artwork": null
    }
  ]
}
```

---

## Endpoint

```
GET /api/galleries/[galleryId]/manifest
```

- Público para galerías con `visibility = PUBLIC`.
- Requiere autenticación para galerías con `visibility = PRIVATE` (solo el artista propietario).
- Respuesta cacheable. Se invalida cuando el artista publica o retira una obra, o modifica la configuración de la galería.
