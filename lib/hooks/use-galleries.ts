'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Gallery } from '@prisma/client'

export type GalleryWithCount = Gallery & {
  exposedCount:  number
  previewImages: string[]
}

export const GALLERIES_KEY = ['galleries'] as const

async function fetchGalleries(): Promise<GalleryWithCount[]> {
  const res = await fetch('/api/galleries')
  if (!res.ok) throw new Error('Error al cargar las galerías')
  return res.json()
}

export function useGalleries() {
  return useQuery({ queryKey: GALLERIES_KEY, queryFn: fetchGalleries })
}

export function useCreateGallery() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { name: string; description?: string; visibility?: 'PUBLIC' | 'PRIVATE' }) => {
      const res = await fetch('/api/galleries', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Error al crear la galería')
      }
      return res.json() as Promise<Gallery>
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: GALLERIES_KEY }),
  })
}

export function useUpdateGallery() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Gallery> & { id: string }) => {
      const res = await fetch(`/api/galleries/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Error al actualizar la galería')
      }
      return res.json() as Promise<Gallery>
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: GALLERIES_KEY }),
  })
}

export function useDeleteGallery() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/galleries/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Error al eliminar la galería')
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: GALLERIES_KEY }),
  })
}
