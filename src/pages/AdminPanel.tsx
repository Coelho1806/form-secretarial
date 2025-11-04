import { useState, useEffect } from 'react'
import { getAllClients, addClient, updateClient, deleteClient, getStats, getClientSubmissions } from '../services/clientService'
import { useAuth, useUser } from '@clerk/clerk-react'

export default function AdminPanel() {
  const { getToken } = useAuth()
  const { user } = useUser()
  const [clients, setClients] = useState<Record<string, any>>({})
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingClient, setEditingClient] = useState<string | null>(null)
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loadingSubmissions, setLoadingSubmissions] = useState(false)
  const [showPromptModal, setShowPromptModal] = useState(false)
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [generatingPrompt, setGeneratingPrompt] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null)
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null)
  const [showTokenModal, setShowTokenModal] = useState(false)
  const [formData, setFormData] = useState({
    clientId: '',
    name: '',
    chatwootAccountId: '',
    googleCalendarOAuthUrl: '',
    googleDriveOAuthUrl: '',
    googleTasksOAuthUrl: '',
    googleGmailOAuthUrl: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [clientsData, statsData] = await Promise.all([
        getAllClients(),
        getStats(),
      ])
      setClients(clientsData)
      setStats(statsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const openAddModal = () => {
    setFormData({
      clientId: '',
      name: '',
      chatwootAccountId: '',
      googleCalendarOAuthUrl: '',
      googleDriveOAuthUrl: '',
      googleTasksOAuthUrl: '',
      googleGmailOAuthUrl: '',
    })
    setEditingClient(null)
    setShowModal(true)
  }

  const openEditModal = (clientId: string) => {
    const client = clients[clientId]
    setFormData({
      clientId,
      name: client.name,
      chatwootAccountId: client.chatwootAccountId || '',
      googleCalendarOAuthUrl: client.googleCalendarOAuthUrl || '',
      googleDriveOAuthUrl: client.googleDriveOAuthUrl || '',
      googleTasksOAuthUrl: client.googleTasksOAuthUrl || '',
      googleGmailOAuthUrl: client.googleGmailOAuthUrl || '',
    })
    setEditingClient(clientId)
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.clientId || !formData.name) {
      alert('Preencha todos os campos obrigatórios!')
      return
    }

    const clientData = {
      name: formData.name,
      chatwootAccountId: formData.chatwootAccountId,
      googleCalendarOAuthUrl: formData.googleCalendarOAuthUrl,
      googleDriveOAuthUrl: formData.googleDriveOAuthUrl,
      googleTasksOAuthUrl: formData.googleTasksOAuthUrl,
      googleGmailOAuthUrl: formData.googleGmailOAuthUrl,
      telegramBotToken: '',
      telegramId: '',
    }

    try {
      if (editingClient) {
        await updateClient(formData.clientId, clientData)
      } else {
        await addClient(formData.clientId, clientData)
      }
      await loadData()
      setShowModal(false)
    } catch (error) {
      alert('Erro ao salvar cliente. Tente novamente.')
    }
  }

  const handleDelete = async (clientId: string) => {
    if (confirm(`Tem certeza que deseja deletar o cliente "${clients[clientId].name}"?`)) {
      try {
        await deleteClient(clientId)
        await loadData()
      } catch (error) {
        alert('Erro ao deletar cliente. Tente novamente.')
      }
    }
  }

  const copyToClipboard = (link: string) => {
    navigator.clipboard.writeText(link)
    alert('Link copiado!')
  }

  const viewSubmissions = async (clientId: string) => {
    setSelectedClientId(clientId)
    setShowSubmissionsModal(true)
    setLoadingSubmissions(true)
    try {
      const data = await getClientSubmissions(clientId)
      setSubmissions(data)
      
      // Tentar obter o token do Google
      await fetchGoogleToken()
    } catch (error) {
      console.error('Error loading submissions:', error)
    } finally {
      setLoadingSubmissions(false)
    }
  }

  const fetchGoogleToken = async () => {
    try {
      // Tentar obter o token OAuth do Google
      const token = await getToken({ template: 'oauth_google' })
      if (token) {
        setGoogleAccessToken(token)
      } else {
        // Fallback: tentar obter o token de sessão
        const sessionToken = await getToken()
        setGoogleAccessToken(sessionToken)
      }
    } catch (error) {
      console.error('Error fetching Google token:', error)
      setGoogleAccessToken(null)
    }
  }

  const copyTokenToClipboard = () => {
    if (googleAccessToken) {
      navigator.clipboard.writeText(googleAccessToken)
      alert('✅ Token copiado para a área de transferência!')
    }
  }

  const generatePromptWithAI = async (submission: any) => {
    setSelectedSubmission(submission)
    setGeneratingPrompt(true)
    setShowPromptModal(true)
    
    try {
      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          submissionData: {
            ...submission,
            submission_id: submission.id
          }
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao gerar prompt')
      }

      const data = await response.json()
      setGeneratedPrompt(data.adaptedPrompt)
      
      // Refresh submissions to show the saved prompt
      if (selectedClientId) {
        const updatedSubmissions = await getClientSubmissions(selectedClientId)
        setSubmissions(updatedSubmissions)
      }
    } catch (error) {
      console.error('Erro ao gerar prompt:', error)
      alert('Erro ao gerar prompt com IA. Verifique se a API Key está configurada.')
      setShowPromptModal(false)
    } finally {
      setGeneratingPrompt(false)
    }
  }

  const copyPromptToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt)
    alert('Prompt copiado para a área de transferência!')
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                🔧 Painel de Administração
              </h1>
              <p className="text-gray-600">Gerencie os clientes do formulário de onboarding</p>
            </div>
            <button
              onClick={openAddModal}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Novo Cliente
            </button>
          </div>
        </div>

        {/* Statistics Dashboard */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total de Submissões</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {stats.submissions?.total_submissions || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Últimos 7 Dias</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {stats.submissions?.last_7_days || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Últimos 30 Dias</p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.submissions?.last_30_days || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Clientes Únicos</p>
                  <p className="text-3xl font-bold text-indigo-600">
                    {stats.submissions?.unique_clients || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top Clients */}
        {stats && stats.clients && stats.clients.length > 0 && (
          <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">🏆 Top Clientes por Submissões</h2>
            <div className="space-y-3">
              {stats.clients.slice(0, 5).map((client, index) => (
                <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{client.name}</p>
                      <p className="text-xs text-gray-500">{client.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-indigo-600">{client.submission_count}</p>
                    <p className="text-xs text-gray-500">submissões</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clientes */}
        <div className="space-y-4">
          {Object.keys(clients).length === 0 ? (
            <div className="bg-white rounded-lg shadow-xl p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Nenhum cliente cadastrado</h3>
              <p className="text-gray-600 mb-6">Clique em "Novo Cliente" para adicionar o primeiro cliente</p>
            </div>
          ) : (
            Object.entries(clients).map(([clientId, client]) => {
              const link = `${window.location.origin}/?client=${clientId}`
              return (
                <div key={clientId} className="bg-white rounded-lg shadow-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">{client.name}</h3>
                      <p className="text-sm text-gray-500 font-mono">ID: {clientId}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => viewSubmissions(clientId)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Ver Dados
                      </button>
                      <button
                        onClick={() => openEditModal(clientId)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(clientId)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Deletar
                      </button>
                    </div>
                  </div>

                  <div className="mb-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700 mb-2">Google OAuth URLs:</p>
                    {client.googleCalendarOAuthUrl && (
                      <div className="text-sm">
                        <span className="font-medium">🗓️ Calendar: </span>
                        <span className="text-gray-600 break-all font-mono bg-gray-50 p-1 rounded">{client.googleCalendarOAuthUrl}</span>
                      </div>
                    )}
                    {client.googleDriveOAuthUrl && (
                      <div className="text-sm">
                        <span className="font-medium">📁 Drive: </span>
                        <span className="text-gray-600 break-all font-mono bg-gray-50 p-1 rounded">{client.googleDriveOAuthUrl}</span>
                      </div>
                    )}
                    {client.googleTasksOAuthUrl && (
                      <div className="text-sm">
                        <span className="font-medium">✅ Tasks: </span>
                        <span className="text-gray-600 break-all font-mono bg-gray-50 p-1 rounded">{client.googleTasksOAuthUrl}</span>
                      </div>
                    )}
                    {client.googleGmailOAuthUrl && (
                      <div className="text-sm">
                        <span className="font-medium">✉️ Gmail: </span>
                        <span className="text-gray-600 break-all font-mono bg-gray-50 p-1 rounded">{client.googleGmailOAuthUrl}</span>
                      </div>
                    )}
                    {!client.googleCalendarOAuthUrl && !client.googleDriveOAuthUrl && !client.googleTasksOAuthUrl && !client.googleGmailOAuthUrl && (
                      <p className="text-sm text-gray-400 italic">Nenhum link OAuth configurado</p>
                    )}
                  </div>

                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-indigo-900 mb-2">🔗 Link do Formulário:</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={link}
                        readOnly
                        className="flex-1 px-3 py-2 bg-white border border-indigo-300 rounded text-sm font-mono"
                      />
                      <button
                        onClick={() => copyToClipboard(link)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Copiar
                      </button>
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Abrir
                      </a>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Submissions Modal */}
      {showSubmissionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-800">
                📋 Dados Submetidos - {selectedClientId && clients[selectedClientId]?.name}
              </h2>
              <button
                onClick={() => {
                  setShowSubmissionsModal(false)
                  setSelectedClientId(null)
                  setSubmissions([])
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {loadingSubmissions ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Carregando submissões...</p>
                </div>
              ) : submissions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">Nenhuma submissão encontrada para este cliente.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {submissions.map((submission, index) => (
                    <div key={submission.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Submissão #{index + 1}</h3>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => generatePromptWithAI(submission)}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Gerar Prompt com IA
                          </button>
                          <span className="text-sm text-gray-500">
                            {new Date(submission.created_at).toLocaleString('pt-BR')}
                          </span>
                        </div>
                      </div>

                      {/* Clinic Info */}
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-700 mb-2">🏥 Informações da Clínica</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div><span className="font-medium">Nome:</span> {submission.clinic_name}</div>
                          <div><span className="font-medium">Telefone:</span> {submission.phone}</div>
                          <div><span className="font-medium">WhatsApp:</span> {submission.whatsapp}</div>
                          <div><span className="font-medium">Email:</span> {submission.email}</div>
                          <div className="col-span-2">
                            <span className="font-medium">Endereço:</span> {submission.address_street}, {submission.address_number} - {submission.address_neighborhood}, {submission.address_city}/{submission.address_state} - CEP: {submission.address_cep}
                          </div>
                          <div><span className="font-medium">Horário:</span> {submission.weekday_hours}</div>
                          {submission.website && <div><span className="font-medium">Site:</span> {submission.website}</div>}
                        </div>
                      </div>

                      {/* Professionals */}
                      {submission.professionals && (() => {
                        const professionals = typeof submission.professionals === 'string' 
                          ? JSON.parse(submission.professionals) 
                          : submission.professionals;
                        return professionals.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-700 mb-2">👨‍⚕️ Profissionais</h4>
                          <div className="space-y-2">
                            {professionals.map((prof: any, idx: number) => (
                              <div key={idx} className="bg-white p-3 rounded border border-gray-200 text-sm">
                                <div className="font-medium">{prof.name} - {prof.specialty}</div>
                                <div className="text-gray-600">Horário: {prof.schedule} | Consulta: {prof.consultationFee}</div>
                                <div className="text-gray-500 text-xs">Agenda ID: {prof.calendarId}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )})()}

                      {/* Payment Methods */}
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-700 mb-2">💳 Formas de Pagamento</h4>
                        <div className="flex flex-wrap gap-2">
                          {(typeof submission.payment_methods === 'string' 
                            ? JSON.parse(submission.payment_methods) 
                            : submission.payment_methods).map((method: string, idx: number) => (
                            <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                              {method}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Insurance */}
                      {submission.accepts_insurance && (() => {
                        const insuranceList = typeof submission.insurance_list === 'string' 
                          ? JSON.parse(submission.insurance_list) 
                          : submission.insurance_list;
                        return insuranceList.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-700 mb-2">🏥 Convênios Aceitos</h4>
                          <div className="flex flex-wrap gap-2">
                            {insuranceList.map((insurance: string, idx: number) => (
                              <span key={idx} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                {insurance}
                              </span>
                            ))}
                          </div>
                        </div>
                      )})()}

                      {/* Integrations */}
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-700 mb-2">🔗 Integrações</h4>
                        <div className="grid grid-cols-1 gap-3 text-sm">
                          {submission.telegram_id && <div><span className="font-medium">Telegram ID:</span> {submission.telegram_id}</div>}
                          {submission.telegram_bot_token && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Bot Token:</span>
                            <code className="bg-gray-100 px-2 py-0.5 rounded font-mono break-all">{submission.telegram_bot_token}</code>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(submission.telegram_bot_token)
                                alert('✅ Token copiado para a área de transferência!')
                              }}
                              className="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs"
                            >
                              Copiar
                            </button>
                          </div>
                          )}
                          
                          {/* Google Access Token */}
                          {user && (
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-blue-900">🔑 Google Access Token</span>
                                <button
                                  onClick={() => setShowTokenModal(true)}
                                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
                                >
                                  Ver Token
                                </button>
                              </div>
                              <p className="text-xs text-blue-700">
                                Token de autenticação do Google OAuth via Clerk
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Generated Prompt */}
                      {submission.adapted_prompt && (
                        <div className="mt-6 pt-6 border-t border-gray-300">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              Prompt Personalizado Gerado
                            </h4>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(submission.adapted_prompt)
                                alert('✅ Prompt copiado para a área de transferência!')
                              }}
                              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              Copiar
                            </button>
                          </div>
                          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-xs overflow-x-auto whitespace-pre-wrap max-h-96 overflow-y-auto">
                            {submission.adapted_prompt}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Prompt AI Modal */}
      {showPromptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-800">
                ⚡ Prompt Personalizado - {selectedSubmission?.clinic_name}
              </h2>
              <button
                onClick={() => {
                  setShowPromptModal(false)
                  setGeneratedPrompt('')
                  setSelectedSubmission(null)
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {generatingPrompt ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Gerando prompt personalizado com GPT-5...</p>
                  <p className="text-sm text-gray-500 mt-2">Isso pode levar alguns segundos</p>
                </div>
              ) : generatedPrompt ? (
                <div>
                  <div className="mb-4 flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      Prompt adaptado com as informações reais da clínica. Copie e use no seu assistente virtual.
                    </p>
                    <button
                      onClick={copyPromptToClipboard}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copiar Prompt
                    </button>
                  </div>
                  <div className="bg-gray-900 text-gray-100 p-6 rounded-lg font-mono text-sm overflow-x-auto whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
                    {generatedPrompt}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">Erro ao gerar prompt. Tente novamente.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Token Modal */}
      {showTokenModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                🔑 Google Access Token
              </h2>
              <button
                onClick={() => setShowTokenModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {googleAccessToken ? (
                <div>
                  <div className="mb-4">
                    <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                      </svg>
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Como usar este token:</p>
                        <ul className="list-disc list-inside space-y-1 text-blue-700">
                          <li>Use no header: <code className="bg-blue-100 px-1 rounded">Authorization: Bearer [TOKEN]</code></li>
                          <li>Válido para Google Calendar, Drive, Tasks, Gmail APIs</li>
                          <li>Token expira automaticamente - será renovado pelo Clerk</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Token de Acesso
                      </label>
                      <button
                        onClick={copyTokenToClipboard}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-medium transition-colors flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copiar
                      </button>
                    </div>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-xs break-all max-h-64 overflow-y-auto">
                      {googleAccessToken}
                    </div>
                  </div>

                  {user?.externalAccounts && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-medium text-green-900 mb-2">
                        ✅ Conta Google Conectada
                      </p>
                      <div className="text-xs text-green-700 space-y-1">
                        {user.externalAccounts
                          .filter((acc: any) => acc.provider === 'google')
                          .map((acc: any, idx: number) => (
                            <div key={idx}>
                              <span className="font-medium">Email:</span> {acc.emailAddress}
                              <br />
                              <span className="font-medium">Scopes:</span>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {(acc.approvedScopes?.split(' ') || []).map((scope: string, i: number) => (
                                  <span key={i} className="bg-green-100 px-2 py-0.5 rounded text-xs">
                                    {scope.replace('https://www.googleapis.com/auth/', '')}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <p className="text-gray-700 font-medium mb-2">Token não disponível</p>
                  <p className="text-sm text-gray-600">
                    O usuário precisa estar autenticado com Google via Clerk
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID do Cliente (usado na URL) *
                </label>
                <input
                  type="text"
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  disabled={editingClient !== null}
                  placeholder="ex: clinica-saude-total"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Use apenas letras minúsculas, números e hífens</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Clínica *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ex: Clínica Saúde Total"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chatwoot Account ID
                </label>
                <input
                  type="text"
                  value={formData.chatwootAccountId}
                  onChange={(e) => setFormData({ ...formData, chatwootAccountId: e.target.value })}
                  placeholder="ex: 12345"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">ID da conta do Chatwoot para integração com n8n workflows</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">🔗 OAuth Configuration</h3>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                    </svg>
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">OAuth is now handled by Clerk</p>
                      <p className="text-blue-700">Clients will connect their Google account directly when filling the form (Step 4). No manual OAuth URLs needed!</p>
                      <p className="text-blue-700 mt-2">For n8n workflows, use: <code className="bg-blue-100 px-2 py-0.5 rounded font-mono text-xs">POST /api/oauth/google-token</code></p>
                    </div>
                  </div>
                </div>
              </div>


              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                >
                  {editingClient ? 'Salvar Alterações' : 'Criar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
