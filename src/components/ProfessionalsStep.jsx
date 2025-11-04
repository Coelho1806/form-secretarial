import { useState } from 'react'

export default function ProfessionalsStep({ form }) {
  const [professionals, setProfessionals] = useState([])

  const addProfessional = () => {
    const newProfessional = {
      id: Date.now(),
      name: '',
      specialty: '',
      schedule: '',
      consultationFee: '',
      calendarId: '',
    }
    setProfessionals([...professionals, newProfessional])
    
    form.setFieldValue('professionals', [...professionals, newProfessional])
  }

  const removeProfessional = (id) => {
    const updated = professionals.filter(p => p.id !== id)
    setProfessionals(updated)
    form.setFieldValue('professionals', updated)
  }

  const updateProfessional = (id, field, value) => {
    const updated = professionals.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    )
    setProfessionals(updated)
    form.setFieldValue('professionals', updated)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Profissionais e Especialidades
      </h2>

      <p className="text-gray-600 mb-4">
        Poderia me fornecer uma lista com o nome completo de cada profissional que realiza atendimentos?
      </p>

      {/* Professional List */}
      <div className="space-y-4">
        {professionals.map((professional, index) => (
          <div key={professional.id} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Profissional #{index + 1}</h3>
              <button
                type="button"
                onClick={() => removeProfessional(professional.id)}
                className="text-red-600 hover:text-red-800 font-medium text-sm"
              >
                Remover
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome completo *
                </label>
                <input
                  type="text"
                  value={professional.name}
                  onChange={(e) => updateProfessional(professional.id, 'name', e.target.value)}
                  placeholder="Ex: Dr. João Silva"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Specialty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Especialidade *
                </label>
                <input
                  type="text"
                  value={professional.specialty}
                  onChange={(e) => updateProfessional(professional.id, 'specialty', e.target.value)}
                  placeholder="Ex: Cardiologia"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Schedule */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dias e horários *
                </label>
                <input
                  type="text"
                  value={professional.schedule}
                  onChange={(e) => updateProfessional(professional.id, 'schedule', e.target.value)}
                  placeholder="Ex: Seg e Qua 14h-18h"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Consultation Fee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor da consulta *
                </label>
                <input
                  type="text"
                  value={professional.consultationFee}
                  onChange={(e) => updateProfessional(professional.id, 'consultationFee', e.target.value)}
                  placeholder="Ex: R$ 250,00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Calendar ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID da agenda *
                </label>
                <input
                  type="text"
                  value={professional.calendarId}
                  onChange={(e) => updateProfessional(professional.id, 'calendarId', e.target.value)}
                  placeholder="Ex: agenda-dr-joao"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Professional Button */}
      <button
        type="button"
        onClick={addProfessional}
        className="w-full py-3 px-4 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Adicionar Profissional
      </button>

      {professionals.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Nenhum profissional adicionado ainda.</p>
          <p className="text-sm mt-2">Clique no botão acima para adicionar.</p>
        </div>
      )}
    </div>
  )
}
