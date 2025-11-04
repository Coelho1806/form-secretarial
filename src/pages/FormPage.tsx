import { useState, useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { useUser } from '@clerk/clerk-react'
import WelcomeStep from '../components/WelcomeStep'
import ClinicInfoStep from '../components/ClinicInfoStep'
import ProfessionalsStep from '../components/ProfessionalsStep'
import FinancialStep from '../components/FinancialStep'
import IntegrationsStep from '../components/IntegrationsStep'
import VideoPlayer from '../components/VideoPlayer'
import { getClientConfig, submitForm, saveDraft, getDraft, deleteDraft } from '../services/clientService'

export default function FormPage() {
  const { user } = useUser()
  
  // CRITICAL: Check if we need to redirect back after OAuth
  useEffect(() => {
    const savedUrl = sessionStorage.getItem('form_client_url')
    const currentUrl = window.location.href
    
    // If we have a saved URL and we're not at it, redirect back
    if (savedUrl && savedUrl !== currentUrl && !currentUrl.includes('?client=')) {
      console.log('Redirecting back to form:', savedUrl)
      window.location.href = savedUrl
      return
    }
  }, [])
  
  const [clientId, setClientId] = useState('')
  const [currentStep, setCurrentStep] = useState(0)
  
  // Persist current step per client to survive OAuth redirects
  useEffect(() => {
    if (clientId) {
      sessionStorage.setItem(`form_step_${clientId}`, String(currentStep))
    }
  }, [currentStep, clientId])
  const [clientName, setClientName] = useState('')
  const [clientConfig, setClientConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [validationErrors, setValidationErrors] = useState([])
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [initialFormData, setInitialFormData] = useState(null)
  const [initialStep, setInitialStep] = useState(null)

  // Pega o clientId da URL (ex: ?client=clinica-saude-total)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const urlClientId = urlParams.get('client')
    
    if (!urlClientId) {
      setError('Link inválido. Entre em contato com o suporte.')
      setLoading(false)
      return
    }
    
    // CRITICAL: Save the full URL immediately for OAuth redirects
    sessionStorage.setItem('form_client_url', window.location.href)
    sessionStorage.setItem('form_client_id', urlClientId)
    
    setClientId(urlClientId)
    
    async function loadConfig() {
      const config = await getClientConfig(urlClientId)
      
      if (config.error) {
        setError(config.message)
        setLoading(false)
        return
      }
      
      setClientConfig(config)
      setClientName(config.name)
      // Auto-complete clinic name from client config
      // defer filling until form is ready
      
      // Try to load saved draft
      const draft = await getDraft(urlClientId)
      if (draft && draft.formData) {
        // Defer restoring form data until form is initialized
        setInitialFormData(draft.formData)
        setInitialStep(draft.currentStep || 0)
      } else {
        // Fallback: restore last step from sessionStorage
        const savedStepStr = sessionStorage.getItem(`form_step_${urlClientId}`)
        const savedStep = savedStepStr ? parseInt(savedStepStr, 10) : 0
        if (!Number.isNaN(savedStep) && savedStep > 0) {
          setCurrentStep(savedStep)
        }
      }
      
      setLoading(false)
    }
    
    loadConfig()
  }, [])

  const form = useForm({
    defaultValues: {
      // Step 1: Clinic Info
      clinicName: '',
      address: {
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        cep: '',
      },
      weekdayHours: '',
      lunchBreak: false,
      lunchBreakTime: '',
      weekendHolidays: false,
      weekendHolidayHours: '',
      phone: '',
      whatsapp: '',
      email: '',
      website: '',
      
      // Step 2: Professionals
      professionals: [],
      
      // Step 3: Financial
      paymentMethods: [],
      acceptsInsurance: false,
      insuranceList: [],
      
      // Step 4: Integrations
      googleOAuth: '',
      telegramId: '',
      telegramBotToken: '',
    },
    onSubmit: async ({ value }) => {
      try {
        setSaving(true)
        await submitForm(clientId, value)
        // Delete draft after successful submission
        await deleteDraft(clientId)
        setIsSubmitted(true)
      } catch (error) {
        alert('❌ Erro ao enviar dados. Tente novamente.')
        setSaving(false)
      }
    },
  })

  // Sync clinicName into form when available
  useEffect(() => {
    if (clientName) {
      form.setFieldValue('clinicName', clientName)
    }
  }, [clientName])

  // Apply any deferred initial form data after form is ready
  useEffect(() => {
    if (initialFormData) {
      Object.entries(initialFormData).forEach(([key, value]) => {
        // @ts-ignore
        form.setFieldValue(key, value)
      })
      if (initialStep !== null) setCurrentStep(initialStep)
      setInitialFormData(null)
    }
  }, [initialFormData, initialStep])

  // Auto-save when reaching step 5 (index 4)
  useEffect(() => {
    if (currentStep === 4 && clientId) {
      const key = `auto_saved_step4_${clientId}`
      if (sessionStorage.getItem(key) !== '1') {
        const values = form.state.values
        saveDraft(clientId, values, 4).catch(() => {})
        sessionStorage.setItem(key, '1')
      }
    }
  }, [currentStep, clientId])

  const validateStep = (step) => {
    const errors = []
    const values = form.state.values

    // Step 0: WelcomeStep - no validation
    if (step === 1) { // ClinicInfoStep
      if (!values.clinicName?.trim()) errors.push('Nome da clínica')
      if (!values.address?.street?.trim()) errors.push('Rua')
      if (!values.address?.number?.trim()) errors.push('Número')
      if (!values.address?.neighborhood?.trim()) errors.push('Bairro')
      if (!values.address?.city?.trim()) errors.push('Cidade')
      if (!values.address?.state?.trim()) errors.push('Estado')
      if (!values.address?.cep?.trim()) errors.push('CEP')
      if (!values.weekdayHours?.trim()) errors.push('Horário de funcionamento')
      if (!values.phone?.trim()) errors.push('Telefone')
      if (!values.whatsapp?.trim()) errors.push('WhatsApp')
      if (!values.email?.trim()) errors.push('E-mail')
    } else if (step === 2) { // ProfessionalsStep
      if (!values.professionals || values.professionals.length === 0) {
        errors.push('Adicione pelo menos um profissional')
      } else {
        values.professionals.forEach((prof, idx) => {
          if (!prof.name?.trim()) errors.push(`Nome do profissional #${idx + 1}`)
          if (!prof.specialty?.trim()) errors.push(`Especialidade do profissional #${idx + 1}`)
          if (!prof.schedule?.trim()) errors.push(`Horário do profissional #${idx + 1}`)
          if (!prof.consultationFee?.trim()) errors.push(`Valor da consulta do profissional #${idx + 1}`)
          if (!prof.calendarId?.trim()) errors.push(`ID da agenda do profissional #${idx + 1}`)
        })
      }
    } else if (step === 3) { // FinancialStep
      if (!values.paymentMethods || values.paymentMethods.length === 0) {
        errors.push('Selecione pelo menos uma forma de pagamento')
      }
    } else if (step === 4) { // IntegrationsStep
      if (!values.telegramId?.trim()) errors.push('Telegram ID')
      if (!values.telegramBotToken?.trim()) errors.push('Bot Token do Telegram')
    }

    return errors
  }

  const steps = [
    { component: WelcomeStep, title: 'Bem-vindo', videoUrl: null },
    { component: ClinicInfoStep, title: 'Informações da Clínica', videoUrl: null },
    { component: ProfessionalsStep, title: 'Profissionais e Especialidades', videoUrl: null },
    { component: FinancialStep, title: 'Informações Financeiras', videoUrl: null },
    { component: IntegrationsStep, title: 'Conexões e Integrações', videoUrl: null },
  ]

  const CurrentStepComponent = steps[currentStep].component

  const handleNext = (e) => {
    e.preventDefault() // Prevent form submit
    e.stopPropagation()
    
    const errors = validateStep(currentStep)
    
    if (errors.length > 0) {
      setValidationErrors(errors)
      alert('⚠️ Campos obrigatórios faltando:\n\n' + errors.join('\n'))
      return
    }
    
    setValidationErrors([])
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = (e) => {
    e.preventDefault() // Prevent form submit
    e.stopPropagation()
    
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    const errors = validateStep(currentStep)
    if (errors.length > 0) {
      setValidationErrors(errors)
      alert('⚠️ Campos obrigatórios faltando:\n\n' + errors.join('\n'))
      return
    }
    
    form.handleSubmit()
  }

  const handleSaveForLater = async (e) => {
    e.preventDefault() // Prevent form submit
    e.stopPropagation()
    
    try {
      setSaving(true)
      await saveDraft(clientId, form.state.values, currentStep)
      // silent success
    } catch (error) {
      // silent failure
      console.error('Save draft failed', error)
    } finally {
      setSaving(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Erro ao Carregar</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <a href="mailto:suporte@seudominio.com" className="inline-block px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
            Contatar Suporte
          </a>
        </div>
      </div>
    )
  }

  // Success state
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl p-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            🎉 Configuração Concluída!
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Sua Assistente IA foi configurada com sucesso e já está pronta para usar.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <p className="text-sm font-medium text-blue-900 mb-2">💡 Próximos passos:
            </p>
            <ul className="text-left text-sm text-blue-800 space-y-2">
              <li>• Nossa equipe vai revisar suas informações</li>
              <li>• Você receberá um e-mail de confirmação em breve</li>
              <li>• A assistente estará disponível em até 24 horas</li>
            </ul>
          </div>
          <button
            onClick={() => {
              setIsSubmitted(false)
              setCurrentStep(0)
              window.scrollTo(0, 0)
            }}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar Dados
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-indigo-900 mb-2">
              Configuração da Assistente IA
            </h1>
            <p className="text-gray-600">
              Etapa {currentStep + 1} de {steps.length}: {steps[currentStep].title}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`flex-1 h-2 mx-1 rounded-full transition-all ${
                    index <= currentStep ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Video Player */}
          {steps[currentStep].videoUrl && (
            <div className="mb-6">
              <VideoPlayer videoUrl={steps[currentStep].videoUrl} />
            </div>
          )}

          {/* Form Content */}
          <div className="bg-white rounded-lg shadow-xl p-8">
            <form onSubmit={handleSubmit}>
              <CurrentStepComponent
                form={form}
                clientName={clientName}
                setClientName={setClientName}
                clientConfig={clientConfig}
              />

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className="px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gray-200 hover:bg-gray-300 text-gray-700"
                  >
                    Anterior
                  </button>
                  
                  {currentStep > 0 && (
                    <button
                      type="button"
                      onClick={handleSaveForLater}
                      disabled={saving}
                      className="px-6 py-2 rounded-lg font-medium transition-all bg-yellow-500 hover:bg-yellow-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Salvando...' : '💾 Salvar para Depois'}
                    </button>
                  )}
                </div>

                {currentStep < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2 rounded-lg font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-all"
                  >
                    Próximo
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 rounded-lg font-medium bg-green-600 hover:bg-green-700 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Enviando...' : '✅ Finalizar Configuração'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

