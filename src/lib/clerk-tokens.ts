/**
 * Utilitário para obter tokens OAuth do Clerk
 */

import { useAuth } from '@clerk/clerk-react'

/**
 * Hook para obter tokens do Clerk
 * @example
 * const { getGoogleToken, getSessionToken } = useClerkTokens()
 * const token = await getGoogleToken()
 */
export function useClerkTokens() {
  const { getToken } = useAuth()

  /**
   * Obtém o token OAuth do Google
   * @returns Token de acesso do Google
   */
  const getGoogleToken = async () => {
    try {
      // Para obter o token OAuth do Google especificamente
      const token = await getToken({ template: 'oauth_google' })
      return token
    } catch (error) {
      console.error('Erro ao obter token do Google:', error)
      return null
    }
  }

  /**
   * Obtém o token de sessão do Clerk
   * @returns Token da sessão atual
   */
  const getSessionToken = async () => {
    try {
      const token = await getToken()
      return token
    } catch (error) {
      console.error('Erro ao obter token de sessão:', error)
      return null
    }
  }

  /**
   * Obtém token com template customizado
   * @param template Nome do template JWT configurado no Clerk
   */
  const getCustomToken = async (template: string) => {
    try {
      const token = await getToken({ template })
      return token
    } catch (error) {
      console.error(`Erro ao obter token ${template}:`, error)
      return null
    }
  }

  return {
    getGoogleToken,
    getSessionToken,
    getCustomToken,
  }
}

/**
 * Função helper para obter informações do token OAuth do Google de um usuário
 */
export function getGoogleAccountInfo(user: any) {
  const googleAccount = user?.externalAccounts?.find(
    (account: any) => account.provider === 'google'
  )

  if (!googleAccount) {
    return null
  }

  return {
    email: googleAccount.emailAddress,
    scopes: googleAccount.approvedScopes?.split(' ') || [],
    hasCalendarAccess: googleAccount.approvedScopes?.includes('https://www.googleapis.com/auth/calendar'),
    hasDriveAccess: googleAccount.approvedScopes?.includes('https://www.googleapis.com/auth/drive'),
    hasTasksAccess: googleAccount.approvedScopes?.includes('https://www.googleapis.com/auth/tasks'),
    hasGmailAccess: googleAccount.approvedScopes?.includes('https://www.googleapis.com/auth/gmail.modify'),
  }
}
