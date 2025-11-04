import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { getClientById, updateClient, deleteClient } from '../../../lib/db.js'

export const Route = createFileRoute('/api/clients/$id')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const client = await getClientById(params.id)
          
          if (!client) {
            return json({ error: 'Client not found' }, { status: 404 })
          }
          
          return json({ client })
        } catch (error) {
          console.error('Error fetching client:', error)
          return json({ error: 'Failed to fetch client' }, { status: 500 })
        }
      },
      
      PUT: async ({ params, request }) => {
        try {
          const body = await request.json()
          const client = await updateClient(params.id, body)
          
          if (!client) {
            return json({ error: 'Client not found' }, { status: 404 })
          }
          
          return json({ client })
        } catch (error) {
          console.error('Error updating client:', error)
          return json({ error: 'Failed to update client' }, { status: 500 })
        }
      },
      
      DELETE: async ({ params }) => {
        try {
          await deleteClient(params.id)
          return new Response(null, { status: 204 })
        } catch (error) {
          console.error('Error deleting client:', error)
          return json({ error: 'Failed to delete client' }, { status: 500 })
        }
      },
    },
  },
})
