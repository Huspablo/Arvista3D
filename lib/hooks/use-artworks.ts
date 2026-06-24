'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Artwork, ArtworkType } from '@prisma/client'

export const ARTWORKS_KEY = ['artworks'] as const

// Tipo enriquecido que devuelve GET /api/artworks:
// incluye galería (nombre + slug) si la obra está expuesta en un slot.
export type ArtworkWithGallery = Artwork & {
  slot: { gallery: { name: string; slug: string } } | null
}

async function fetchArtworks(): Promise<ArtworkWithGallery[]> {
  const res = await fetch('/api/artworks')
  if (!res.ok) throw new Error('Error al cargar las obras')
  return res.json() as Promise<ArtworkWithGallery[]>
}

export function useArtworks() {
  return useQuery({
    queryKey: ARTWORKS_KEY,
    queryFn:  fetchArtworks,
    // Refresca cada 4 s mientras alguna obra tiene imagen subida pero aún sin procesar.
    // Se detiene automáticamente cuando todas las miniaturas están disponibles.
    refetchInterval: (query) => {
      const artworks = query.state.data
      const hasProcessing = artworks?.some(a => a.assetOriginalKey && !a.assetThumbnail)
      return hasProcessing ? 4000 : false
    },
  })
}

export function useCreateArtwork() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      title: string; type: ArtworkType; description?: string
      year?: number; technique?: string; edition?: string; tags?: string[]
      dimWidth?: number; dimHeight?: number; dimDepth?: number
    }) => {
      const res = await fetch('/api/artworks', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Error al crear la obra')
      }
      return res.json() as Promise<Artwork>
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ARTWORKS_KEY }),
  })
}

export function useUpdateArtwork() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Artwork> & { id: string }) => {
      const res = await fetch(`/api/artworks/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Error al actualizar la obra')
      }
      return res.json() as Promise<Artwork>
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ARTWORKS_KEY }),
  })
}

export function useDeleteArtwork() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/artworks/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Error al eliminar la obra')
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ARTWORKS_KEY }),
  })
}

export function usePublishArtwork() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, galleryId }: { id: string; galleryId: string }) => {
      const res = await fetch(`/api/artworks/${id}/publish`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ galleryId }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Error al exponer la obra')
      }
      return res.json() as Promise<Artwork>
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ARTWORKS_KEY }),
  })
}

export function useUnpublishArtwork() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/artworks/${id}/unpublish`, { method: 'POST' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Error al retirar la obra')
      }
      return res.json() as Promise<Artwork>
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ARTWORKS_KEY }),
  })
}
