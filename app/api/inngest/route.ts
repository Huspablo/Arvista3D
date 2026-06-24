import { serve }                  from 'inngest/next'
import { inngest }                 from '@/lib/inngest'
import { processArtworkUpload }    from '@/lib/functions/process-artwork-upload'

export const { GET, POST, PUT } = serve({
  client:    inngest,
  functions: [processArtworkUpload],
})
