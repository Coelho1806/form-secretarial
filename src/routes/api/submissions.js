import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { createFormSubmission, getAllFormSubmissions } from '../../lib/db.js'

export const Route = createFileRoute('/api/submissions')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const submissions = await getAllFormSubmissions()
          return json({ submissions })
        } catch (error) {
          console.error('Error fetching submissions:', error)
          return json({ error: 'Failed to fetch submissions' }, { status: 500 })
        }
      },
      
      POST: async ({ request }) => {
        try {
          const body = await request.json()
          const { clientId, ...formData } = body
          
          if (!clientId) {
            return json({ error: 'Client ID is required' }, { status: 400 })
          }
          
          const submission = await createFormSubmission(clientId, formData)
          return json({ submission }, { status: 201 })
        } catch (error) {
          console.error('Error creating submission:', error)
          return json({ error: 'Failed to create submission' }, { status: 500 })
        }
      },
    },
  },
})
