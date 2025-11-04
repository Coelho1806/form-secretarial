export default function WelcomeStep({ clientName, setClientName }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Olá{clientName ? `, ${clientName}` : ''}!
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Obrigado por contratar nossos serviços.
        </p>
        <p className="text-base text-gray-600">
          Agora, vamos às configurações para a implementação da sua <strong>Assistente IA</strong>.
        </p>
      </div>

      <div className="mt-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Como podemos te chamar?
        </label>
        <input
          type="text"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="Digite seu nome"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
        <h3 className="font-semibold text-blue-900 mb-2">📋 O que vamos configurar:</h3>
        <ul className="space-y-2 text-blue-800">
          <li>• Informações sobre sua clínica</li>
          <li>• Profissionais e especialidades</li>
          <li>• Formas de pagamento e convênios</li>
          <li>• Integrações com Google, WhatsApp e Telegram</li>
        </ul>
      </div>
    </div>
  )
}
