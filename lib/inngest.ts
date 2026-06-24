import { EventSchemas, Inngest } from 'inngest'

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

type Events = {
  'artwork/uploaded': { data: ArtworkUploadedEvent['data'] }
}

export const inngest = new Inngest({
  id:       'arvista-3d',
  eventKey: process.env.INNGEST_EVENT_KEY!,
  schemas:  new EventSchemas().fromRecord<Events>(),
})
