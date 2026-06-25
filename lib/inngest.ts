import { Inngest } from 'inngest'

// Tipos de eventos del sistema
export type ArtworkUploadedEvent = {
  name: 'artwork/uploaded'
  data: {
    artworkId:   string
    artistId:    string
    originalKey: string
    contentType: string
  }
}

export const inngest = new Inngest({
  id:       'arvista-3d',
  eventKey: process.env.INNGEST_EVENT_KEY!,
})
