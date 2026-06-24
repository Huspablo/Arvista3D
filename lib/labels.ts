import type { ArtworkType } from '@prisma/client'

export const TYPE_LABEL: Record<ArtworkType, string> = {
  PAINTING:    'Pintura',
  SCULPTURE:   'Escultura',
  PHOTOGRAPHY: 'Fotografía',
  OTHER:       'Otro',
}
