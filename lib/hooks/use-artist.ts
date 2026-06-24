'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Artist } from '@prisma/client'

export const ARTIST_KEY = ['artist', 'me'] as const

async function fetchArtist(): Promise<Artist> {
  const res = await fetch('/api/artists/me')
  if (!res.ok) throw new Error('Error al cargar el perfil')
  return res.json()
}

export function useArtist() {
  return useQuery({ queryKey: ARTIST_KEY, queryFn: fetchArtist })
}

export function useUpdateArtist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Pick<Artist, 'name' | 'bio' | 'website' | 'avatarUrl'>>) => {
      const res = await fetch('/api/artists/me', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Error al actualizar el perfil')
      }
      return res.json() as Promise<Artist>
    },
    onSuccess: (updated) => qc.setQueryData(ARTIST_KEY, updated),
  })
}
