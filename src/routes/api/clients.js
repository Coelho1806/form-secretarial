import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { getAllClients, createClient as dbCreateClient } from '../../lib/db.js'

export const Route = createFileRoute('/api/clients')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const clients = await getAllClients()
          return json({ clients })
        } catch (error) {
          console.error('Error fetching clients:', error)
          return json({ error: 'Failed to fetch clients' }, { status: 500 })
        }
      },
      
      POST: async ({ request }) => {
        try {
          const body = await request.json()
          const { clientId, ...clientData } = body
          
          if (!clientId || !clientData.name) {
            return json({ error: 'Missing required fields' }, { status: 400 })
          }
          
          const client = await dbCreateClient(clientId, clientData)
          return json({ client }, { status: 201 })
        } catch (error) {
          console.error('Error creating client:', error)
          return json({ error: 'Failed to create client' }, { status: 500 })
        }
      },
    },
  },
})
