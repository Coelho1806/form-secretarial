/**
 * TanStack Start Server Functions for Google OAuth Token Retrieval
 */

import { createServerFn } from '@tanstack/react-start'
import { clerkClient } from '@clerk/express'

export const getGoogleTokenByChatwoot = createServerFn(
  'POST',
  async (payload: { chatwootAccountId: string }) => {
    const { chatwootAccountId } = payload

    if (!chatwootAccountId) {
      throw new Error('Chatwoot Account ID is required')
    }

    try {
      // Import DB functions dynamically
      const { getClientByChatwootId } = await import('../lib/db.js')
      const client = await getClientByChatwootId(chatwootAccountId)

      if (!client) {
        throw new Error(`No client found for Chatwoot Account ID: ${chatwootAccountId}`)
      }

      if (!client.clerkUserId) {
        throw new Error(`Client ${client.id} is not linked to a Clerk user`)
      }

      const user = await clerkClient.users.getUser(client.clerkUserId)
      const googleAccount = user.externalAccounts?.find(
        (account) => account.provider === 'google'
      )

      if (!googleAccount) {
        throw new Error(`User has not connected Google account`)
      }

      const tokenData = await clerkClient.users.getUserOauthAccessToken(
        client.clerkUserId,
        'google'
      )

      if (!tokenData || !tokenData[0]?.token) {
        throw new Error('Failed to retrieve valid access token')
      }

      const token = tokenData[0]

      return {
        success: true,
        access_token: token.token,
        expires_at: token.expiresAt,
        scopes: googleAccount.approvedScopes,
        provider: 'google',
        chatwootAccountId,
        clientId: client.id,
        clientName: client.name,
        email: googleAccount.emailAddress,
      }
    } catch (error) {
      console.error('[getGoogleTokenByChatwoot] Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        chatwootAccountId,
      }
    }
  }
)
