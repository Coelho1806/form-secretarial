import { useUser, SignUp, useClerk } from '@clerk/clerk-react'
import { useState, useEffect } from 'react'

export default function IntegrationsStep({ form, clientConfig }) {
  const { user, isSignedIn } = useUser()
  const { signOut } = useClerk()
  const [showSignUp, setShowSignUp] = useState(false)
  const [googleConnections, setGoogleConnections] = useState({
    calendar: false,
    drive: false,
    tasks: false,
    gmail: false,
  })

  useEffect(() => {
    if (user) {
      const googleAccount = user.externalAccounts?.find(
        account => account.provider === 'google'
      )
      
      if (googleAccount) {
        const scopes = googleAccount.approvedScopes?.split(' ') || []
        setGoogleConnections({
          calendar: scopes.includes('https://www.googleapis.com/auth/calendar'),
          drive: scopes.includes('https://www.googleapis.com/auth/drive'),
          tasks: scopes.includes('https://www.googleapis.com/auth/tasks'),
          gmail: scopes.includes('https://www.googleapis.com/auth/gmail.modify'),
        })
      }
    }
  }, [user])

  // Handle closing modal after sign in
  useEffect(() => {
    if (isSignedIn && showSignUp) {
      setShowSignUp(false)
    }
  }, [isSignedIn, showSignUp])

  const handleSignOut = async () => {
    if (confirm('Tem certeza que deseja sair? Você precisará fazer login novamente para conectar o Google.')) {
      await signOut({ redirectUrl: '/auth/return' })
      setShowSignUp(false)
    }
  }

  const handleGoogleConnect = async () => {
    if (!isSignedIn) {
      // Ensure current step is persisted as integrations step (4)
      const cid = sessionStorage.getItem('form_client_id') || ''
      if (cid) sessionStorage.setItem(`form_step_${cid}`, '4')
      // Show the sign-up modal
      setShowSignUp(true)
      return
    }
    
    // If already signed in, just add external account
    try {
      await user.createExternalAccount({
        strategy: 'oauth_google',
        redirectUrl: `${window.location.origin}/integrations-callback`,
        additionalScopes: [
          'https://www.googleapis.com/auth/calendar',
          'https://www.googleapis.com/auth/drive',
          'https://www.googleapis.com/auth/tasks',
          'https://www.googleapis.com/auth/gmail.modify',
        ],
      })
      alert('✅ Conta Google conectada com sucesso!')
    } catch (error) {
      console.error('Error connecting Google:', error)
      
      // Handle "already connected" error gracefully
      if (error.errors?.[0]?.code === 'oauth_account_already_connected') {
        alert('✅ Sua conta Google já está conectada!')
      } else {
        alert('❌ Erro ao conectar com o Google. Tente novamente.')
      }
    }
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Conexões e Integrações
      </h2>

      {/* Google OAuth */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Conexões com Google</h3>
            <p className="text-gray-600 text-sm mb-4">
              {!isSignedIn 
                ? 'Clique no botão abaixo para criar sua conta e conectar seus serviços do Google.'
                : 'Conecte sua conta do Google para permitir acesso aos serviços necessários.'
              }
            </p>

            {!isSignedIn && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>Importante:</strong> Cada clínica deve usar sua própria conta do Google para manter os dados separados e seguros.
                </p>
                <p className="text-xs text-blue-700">
                  💡 Se você já preencheu o formulário para outra clínica neste navegador, abra uma janela anônima/privada para criar uma conta separada.
                </p>
              </div>
            )}

            {isSignedIn && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-green-800 mb-1">
                      ✅ Conectado como: <strong>{user?.primaryEmailAddress?.emailAddress || 'Usuário'}</strong>
                    </p>
                    <p className="text-xs text-green-700">
                      Esta conta será usada para autorizar os serviços do Google desta clínica.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="px-3 py-1 text-xs text-red-600 hover:text-white hover:bg-red-600 border border-red-600 rounded transition-colors flex-shrink-0"
                  >
                    Sair
                  </button>
                </div>
              </div>
            )}

            {!isSignedIn || (isSignedIn && Object.values(googleConnections).every(v => !v)) ? (
              <button
                type="button"
                onClick={handleGoogleConnect}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {!isSignedIn ? 'Entrar com Google e Autorizar Serviços' : 'Conectar Conta Google'}
              </button>
            ) : null}

            {isSignedIn && Object.values(googleConnections).some(v => v) && (
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className={`px-4 py-3 rounded-lg border ${googleConnections.calendar ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center gap-2">
                      {googleConnections.calendar ? (
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      <span className={`text-sm font-medium ${googleConnections.calendar ? 'text-green-700' : 'text-gray-600'}`}>
                        Google Agenda
                      </span>
                    </div>
                  </div>

                  <div className={`px-4 py-3 rounded-lg border ${googleConnections.drive ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center gap-2">
                      {googleConnections.drive ? (
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      <span className={`text-sm font-medium ${googleConnections.drive ? 'text-green-700' : 'text-gray-600'}`}>
                        Google Drive
                      </span>
                    </div>
                  </div>

                  <div className={`px-4 py-3 rounded-lg border ${googleConnections.tasks ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center gap-2">
                      {googleConnections.tasks ? (
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      <span className={`text-sm font-medium ${googleConnections.tasks ? 'text-green-700' : 'text-gray-600'}`}>
                        Google Tarefas
                      </span>
                    </div>
                  </div>

                  <div className={`px-4 py-3 rounded-lg border ${googleConnections.gmail ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center gap-2">
                      {googleConnections.gmail ? (
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      <span className={`text-sm font-medium ${googleConnections.gmail ? 'text-green-700' : 'text-gray-600'}`}>
                        Gmail
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleConnect}
                  className="mt-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors text-sm"
                >
                  Reconectar / Adicionar Permissões
                </button>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Telegram */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-sky-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Conexão com Telegram</h3>
            <p className="text-gray-600 text-sm mb-4">
              Configure o bot do Telegram para receber notificações e interagir com clientes.
            </p>
            
            <div className="space-y-4">
              <form.Field name="telegramId">
                {(field) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telegram ID *
                    </label>
                    <input
                      type="text"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Ex: @seu_usuario ou 123456789"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="telegramBotToken">
                {(field) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bot Token *
                    </label>
                    <input
                      type="text"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Ex: 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Obtenha seu token com o @BotFather no Telegram
                    </p>
                  </div>
                )}
              </form.Field>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Importante!</p>
            <p>Certifique-se de ter as permissões necessárias antes de conectar estas integrações. As configurações podem ser alteradas posteriormente através do painel de administração.</p>
          </div>
        </div>
      </div>

      {/* Sign Up Modal */}
      {showSignUp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowSignUp(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <SignUp 
              routing="virtual"
              afterSignInUrl="/auth/return"
              afterSignUpUrl="/auth/return"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none"
                }
              }}
            />
          </div>
        </div>
      )}

    </div>
  )
}
