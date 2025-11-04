import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { getSubmissionStats, getClientStats } from '../../lib/db.js'

export const Route = createFileRoute('/api/stats')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const submissionStats = await getSubmissionStats()
          const clientStats = await getClientStats()
          
          return json({
            submissions: submissionStats,
            clients: clientStats,
          })
        } catch (error) {
          console.error('Error fetching stats:', error)
          return json({ error: 'Failed to fetch statistics' }, { status: 500 })
        }
      },
    },
  },
})
