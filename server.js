import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { clerkMiddleware, requireAuth, getAuth } from '@clerk/express'
import {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  createFormSubmission,
  getAllFormSubmissions,
  getSubmissionStats,
  getClientStats,
  saveDraft,
  getDraft,
  deleteDraft,
} from './src/lib/db.js'
import generatePromptHandler from './src/routes/api/generate-prompt.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Clerk configuration
const clerkPublishableKey = process.env.CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY
const clerkSecretKey = process.env.CLERK_SECRET_KEY
const hasClerkKeys = !!(clerkPublishableKey && clerkSecretKey)

if (!hasClerkKeys) {
  console.warn('⚠️  Clerk keys not found. OAuth endpoints will not work.')
  console.warn('   Add CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY to your .env file')
  console.warn('   See: CLERK_OAUTH_SETUP.md for setup instructions')
  console.warn('   App will run normally, but Google OAuth features are disabled.')
}

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Only use Clerk middleware if BOTH keys are present
if (hasClerkKeys) {
  app.use(clerkMiddleware({
    publishableKey: clerkPublishableKey,
    secretKey: clerkSecretKey,
  }))
  console.log('✅ Clerk middleware enabled')
} else {
  // Add a no-op middleware that won't break auth checking
  app.use((req, res, next) => {
    req.auth = null
    next()
  })
  console.log('⚠️  Clerk middleware disabled - running without OAuth')
}

// Health check endpoints
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Formulário Secretária API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      clients: '/api/clients',
      submissions: '/api/form-submissions'
    }
  })
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' })
})

// Clients routes
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await getAllClients()
    res.json({ clients })
  } catch (error) {
    console.error('Error fetching clients:', error)
    res.status(500).json({ error: 'Failed to fetch clients' })
  }
})

app.get('/api/clients/:id', async (req, res) => {
  try {
    const client = await getClientById(req.params.id)
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' })
    }
    
    res.json({ client })
  } catch (error) {
    console.error('Error fetching client:', error)
    res.status(500).json({ error: 'Failed to fetch client' })
  }
})

app.post('/api/clients', async (req, res) => {
  try {
    const { clientId, ...clientData } = req.body
    
    if (!clientId || !clientData.name) {
      return res.status(400).json({ error: 'Missing required fields: clientId and name' })
    }
    
    const client = await createClient(clientId, clientData)
    res.status(201).json({ client })
  } catch (error) {
    console.error('Error creating client:', error)
    res.status(500).json({ error: 'Failed to create client' })
  }
})

app.put('/api/clients/:id', async (req, res) => {
  try {
    const client = await updateClient(req.params.id, req.body)
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' })
    }
    
    res.json({ client })
  } catch (error) {
    console.error('Error updating client:', error)
    res.status(500).json({ error: 'Failed to update client' })
  }
})

app.delete('/api/clients/:id', async (req, res) => {
  try {
    await deleteClient(req.params.id)
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting client:', error)
    res.status(500).json({ error: 'Failed to delete client' })
  }
})

// Submissions routes
app.get('/api/submissions', async (req, res) => {
  try {
    const { clientId } = req.query
    let submissions
    
    if (clientId) {
      // Filter by client ID if provided
      const { getFormSubmissionsByClient } = await import('./src/lib/db.js')
      submissions = await getFormSubmissionsByClient(clientId)
    } else {
      submissions = await getAllFormSubmissions()
    }
    
    res.json({ submissions })
  } catch (error) {
    console.error('Error fetching submissions:', error)
    res.status(500).json({ error: 'Failed to fetch submissions' })
  }
})

app.post('/api/submissions', async (req, res) => {
  try {
    const { clientId, ...formData } = req.body
    
    if (!clientId) {
      return res.status(400).json({ error: 'Client ID is required' })
    }
    
    // Try to link this submission to the authenticated user
    const auth = getAuth(req)
    if (auth.userId) {
      // Update client with Clerk user ID if not already set
      const client = await getClientById(clientId)
      if (client && !client.clerkUserId) {
        await updateClient(clientId, { 
          ...client,
          clerkUserId: auth.userId 
        })
      }
    }
    
    const submission = await createFormSubmission(clientId, formData)
    res.status(201).json({ submission })
  } catch (error) {
    console.error('Error creating submission:', error)
    res.status(500).json({ error: 'Failed to create submission' })
  }
})

// Stats route
app.get('/api/stats', async (req, res) => {
  try {
    const submissionStats = await getSubmissionStats()
    const clientStats = await getClientStats()
    
    res.json({
      submissions: submissionStats,
      clients: clientStats,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    res.status(500).json({ error: 'Failed to fetch statistics' })
  }
})

// Draft routes
app.get('/api/drafts/:clientId', async (req, res) => {
  try {
    const draft = await getDraft(req.params.clientId)
    
    if (!draft) {
      return res.status(404).json({ error: 'No draft found' })
    }
    
    res.json({ draft })
  } catch (error) {
    console.error('Error fetching draft:', error)
    res.status(500).json({ error: 'Failed to fetch draft' })
  }
})

app.post('/api/drafts', async (req, res) => {
  try {
    const { clientId, formData, currentStep } = req.body
    
    if (!clientId || !formData) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    
    const draft = await saveDraft(clientId, formData, currentStep || 0)
    res.status(201).json({ draft })
  } catch (error) {
    console.error('Error saving draft:', error)
    res.status(500).json({ error: 'Failed to save draft' })
  }
})

app.delete('/api/drafts/:clientId', async (req, res) => {
  try {
    await deleteDraft(req.params.clientId)
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting draft:', error)
    res.status(500).json({ error: 'Failed to delete draft' })
  }
})

// AI: Generate adapted prompt
app.post('/api/generate-prompt', async (req, res) => {
  console.log('[server] POST /api/generate-prompt called');
  console.log('[server] Request body keys:', Object.keys(req.body));
  return generatePromptHandler(req, res)
})

// OAuth Token endpoint for n8n - Get Google access token for a user
app.get('/api/oauth/google-token/:userId', requireAuth(), async (req, res) => {
  try {
    const { userId } = req.params
    const auth = getAuth(req)
    
    // Verify the requesting user is authorized (admin or the user themselves)
    if (auth.userId !== userId && !auth.sessionClaims?.metadata?.role === 'admin') {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    // Import Clerk on demand
    const { clerkClient } = await import('@clerk/express')
    const user = await clerkClient.users.getUser(userId)
    
    const googleAccount = user.externalAccounts?.find(
      account => account.provider === 'google'
    )
    
    if (!googleAccount) {
      return res.status(404).json({ 
        error: 'Google account not connected',
        message: 'User has not connected their Google account'
      })
    }

    // Clerk automatically refreshes tokens if needed
    const token = await clerkClient.users.getUserOauthAccessToken(userId, 'google')
    
    if (!token || !token[0]?.token) {
      return res.status(500).json({ 
        error: 'Failed to get access token',
        message: 'Could not retrieve a valid access token'
      })
    }

    res.json({ 
      access_token: token[0].token,
      expires_at: token[0].expiresAt,
      scopes: googleAccount.approvedScopes,
      provider: 'google'
    })
  } catch (error) {
    console.error('Error fetching Google token:', error)
    res.status(500).json({ 
      error: 'Failed to fetch token',
      message: error.message 
    })
  }
})

// OAuth Token endpoint for n8n - By Chatwoot Account ID
app.post('/api/oauth/google-token-chatwoot', async (req, res) => {
  try {
    const { chatwootAccountId } = req.body
    
    if (!chatwootAccountId) {
      return res.status(400).json({ error: 'Chatwoot Account ID is required' })
    }

    // Get client from database by Chatwoot ID
    const { getClientByChatwootId } = await import('./src/lib/db.js')
    const client = await getClientByChatwootId(chatwootAccountId)
    
    if (!client) {
      return res.status(404).json({ 
        error: 'Client not found',
        message: `No client found for Chatwoot Account ID: ${chatwootAccountId}`
      })
    }

    if (!client.clerkUserId) {
      return res.status(404).json({ 
        error: 'Client not linked to user',
        message: `Client ${client.id} is not linked to a Clerk user`
      })
    }

    // Import Clerk on demand
    const { clerkClient } = await import('@clerk/express')
    const user = await clerkClient.users.getUser(client.clerkUserId)
    
    const googleAccount = user.externalAccounts?.find(
      account => account.provider === 'google'
    )
    
    if (!googleAccount) {
      return res.status(404).json({ 
        error: 'Google account not connected',
        message: 'User has not connected their Google account'
      })
    }

    // Clerk automatically refreshes tokens if needed
    const token = await clerkClient.users.getUserOauthAccessToken(client.clerkUserId, 'google')
    
    if (!token || !token[0]?.token) {
      return res.status(500).json({ 
        error: 'Failed to get access token',
        message: 'Could not retrieve a valid access token'
      })
    }

    res.json({ 
      success: true,
      access_token: token[0].token,
      expires_at: token[0].expiresAt,
      scopes: googleAccount.approvedScopes,
      provider: 'google',
      chatwootAccountId,
      clientId: client.id,
      clientName: client.name,
      email: googleAccount.emailAddress
    })
  } catch (error) {
    console.error('Error fetching Google token by Chatwoot ID:', error)
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch token',
      message: error.message 
    })
  }
})

// OAuth Token endpoint for n8n - Simplified for client-based lookup
app.post('/api/oauth/google-token', async (req, res) => {
  try {
    const { clientId } = req.body
    
    if (!clientId) {
      return res.status(400).json({ error: 'Client ID is required' })
    }

    // Get client from database to find associated Clerk user ID
    const client = await getClientById(clientId)
    
    if (!client || !client.clerkUserId) {
      return res.status(404).json({ 
        error: 'Client not found or not linked to a user',
        message: 'Client must be linked to an authenticated user'
      })
    }

    // Import Clerk on demand
    const { clerkClient } = await import('@clerk/express')
    const user = await clerkClient.users.getUser(client.clerkUserId)
    
    const googleAccount = user.externalAccounts?.find(
      account => account.provider === 'google'
    )
    
    if (!googleAccount) {
      return res.status(404).json({ 
        error: 'Google account not connected',
        message: 'User has not connected their Google account'
      })
    }

    // Clerk automatically refreshes tokens if needed
    const token = await clerkClient.users.getUserOauthAccessToken(client.clerkUserId, 'google')
    
    if (!token || !token[0]?.token) {
      return res.status(500).json({ 
        error: 'Failed to get access token',
        message: 'Could not retrieve a valid access token'
      })
    }

    res.json({ 
      access_token: token[0].token,
      expires_at: token[0].expiresAt,
      scopes: googleAccount.approvedScopes,
      provider: 'google',
      clientId: clientId
    })
  } catch (error) {
    console.error('Error fetching Google token for client:', error)
    res.status(500).json({ 
      error: 'Failed to fetch token',
      message: error.message 
    })
  }
})

// Dev: avoid favicon noise
app.get('/favicon.ico', (_req, res) => res.status(204).end())

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
})
