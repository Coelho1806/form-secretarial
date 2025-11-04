import { useState } from 'react'

export default function FinancialStep({ form }) {
  const [paymentMethods, setPaymentMethods] = useState([])
  const [insuranceList, setInsuranceList] = useState([])
  const [newInsurance, setNewInsurance] = useState('')

  const paymentOptions = [
    'PIX',
    'Dinheiro',
    'Cartão de Crédito',
    'Cartão de Débito',
    'Transferência Bancária',
    'Cheque',
  ]

  const togglePaymentMethod = (method) => {
    const updated = paymentMethods.includes(method)
      ? paymentMethods.filter(m => m !== method)
      : [...paymentMethods, method]
    
    setPaymentMethods(updated)
    form.setFieldValue('paymentMethods', updated)
  }

  const addInsurance = () => {
    if (newInsurance.trim()) {
      const updated = [...insuranceList, newInsurance.trim()]
      setInsuranceList(updated)
      form.setFieldValue('insuranceList', updated)
      setNewInsurance('')
    }
  }

  const removeInsurance = (index) => {
    const updated = insuranceList.filter((_, i) => i !== index)
    setInsuranceList(updated)
    form.setFieldValue('insuranceList', updated)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Informações Financeiras e Convênios
      </h2>

      {/* Payment Methods */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">
          Quais são as formas de pagamento aceitas na clínica? *
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {paymentOptions.map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => togglePaymentMethod(method)}
              className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                paymentMethods.includes(method)
                  ? 'bg-indigo-100 border-indigo-600 text-indigo-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-indigo-400'
              }`}
            >
              {method}
            </button>
          ))}
        </div>
      </div>

      {/* Insurance Section */}
      <div className="border-t pt-6">
        <form.Field name="acceptsInsurance">
          {(field) => (
            <div className="flex items-center space-x-3 mb-4">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="font-semibold text-gray-800">
                A clínica atende por convênios médicos?
              </label>
            </div>
          )}
        </form.Field>

        <form.Field name="acceptsInsurance">
          {(field) => (
            field.state.value && (
              <div className="ml-7 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Liste os convênios aceitos
                  </label>
                  
                  {/* Insurance List */}
                  <div className="space-y-2 mb-3">
                    {insuranceList.map((insurance, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg border border-gray-200"
                      >
                        <span className="text-gray-700">{insurance}</span>
                        <button
                          type="button"
                          onClick={() => removeInsurance(index)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Insurance Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newInsurance}
                      onChange={(e) => setNewInsurance(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInsurance())}
                      placeholder="Ex: Unimed, Amil, Bradesco Saúde..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={addInsurance}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </form.Field>
      </div>

      {/* Summary */}
      {(paymentMethods.length > 0 || insuranceList.length > 0) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="font-semibold text-blue-900 mb-3">📋 Resumo:</h3>
          
          {paymentMethods.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium text-blue-800 mb-1">Formas de pagamento:</p>
              <p className="text-blue-700">{paymentMethods.join(', ')}</p>
            </div>
          )}
          
          {insuranceList.length > 0 && (
            <div>
              <p className="text-sm font-medium text-blue-800 mb-1">Convênios aceitos:</p>
              <p className="text-blue-700">{insuranceList.join(', ')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
