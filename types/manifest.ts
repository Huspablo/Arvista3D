export type GalleryManifest = {
  gallery: GalleryMeta
  slots:   SlotManifest[]
}

export type GalleryMeta = {
  id:          string
  name:        string
  templateKey: string
  config:      GalleryConfig
}

export type GalleryConfig = {
  wallColor?:      string
  floorMaterial?:  'concrete' | 'parquet' | 'marble'
  lightingPreset?: 'warm' | 'neutral' | 'dramatic'
}

export type SlotManifest = {
  id:          string
  position:    number
  displayMode: 'WALL_PLANE' | 'FLOOR_MODEL'
  artwork:     ArtworkManifest | null
}

export type ArtworkManifest = {
  id:          string
  title:       string
  artistName:  string
  type:        'PAINTING' | 'SCULPTURE' | 'PHOTOGRAPHY' | 'OTHER'
  year?:       number
  tags:        string[]
  dimensions?: { width: number; height: number; depth?: number }
  assets:      FlatAssets | ModelAssets
}

export type FlatAssets = {
  thumbnail: string
  gallery:   string
  detail:    string
}

export type ModelAssets = {
  model:     string
  thumbnail: string
}
