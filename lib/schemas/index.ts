import { z } from 'zod'

// ── Artista ───────────────────────────────────────────────────────────────────

export const UpdateArtistSchema = z.object({
  name:      z.string().min(1).max(100).optional(),
  bio:       z.string().max(600).optional(),
  website:   z.string().url().optional().or(z.literal('')),
  avatarUrl: z.string().url().optional().or(z.literal('')),
})

// ── Galería ───────────────────────────────────────────────────────────────────

export const CreateGallerySchema = z.object({
  name:        z.string().min(1, 'El nombre es obligatorio').max(80),
  description: z.string().max(400).optional(),
  visibility:  z.enum(['PUBLIC', 'PRIVATE']).optional(),
})

export const UpdateGallerySchema = z.object({
  name:          z.string().min(1).max(80).optional(),
  description:   z.string().max(400).optional(),
  visibility:    z.enum(['PUBLIC', 'PRIVATE']).optional(),
  wallColor:     z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  floorMaterial: z.enum(['CONCRETE', 'PARQUET', 'MARBLE']).optional(),
  lightingPreset:z.enum(['WARM', 'NEUTRAL', 'DRAMATIC']).optional(),
})

// ── Obra ──────────────────────────────────────────────────────────────────────

export const CreateArtworkSchema = z.object({
  title:       z.string().min(1, 'El título es obligatorio').max(120),
  description: z.string().max(1000).optional(),
  type:        z.enum(['PAINTING', 'SCULPTURE', 'PHOTOGRAPHY', 'OTHER']),
  year:        z.number().int().min(1000).max(new Date().getFullYear()).optional(),
  technique:   z.string().max(120).optional(),
  edition:     z.string().max(120).optional(),
  tags:        z.array(z.string().max(40)).max(10).optional(),
  dimWidth:    z.number().positive().optional(),
  dimHeight:   z.number().positive().optional(),
  dimDepth:    z.number().positive().optional(),
})

export const UpdateArtworkSchema = CreateArtworkSchema.partial().extend({
  assetOriginalKey: z.string().optional(),
  assetThumbnail:   z.string().url().optional(),
  assetGallery:     z.string().url().optional(),
  assetDetail:      z.string().url().optional(),
  assetModel:       z.string().url().optional(),
})

export const PublishArtworkSchema = z.object({
  galleryId: z.string().min(1, 'galleryId es obligatorio'),
})
