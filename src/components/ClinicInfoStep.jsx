export default function ClinicInfoStep({ form }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Primeiramente, nos conte mais sobre sua clínica
      </h2>

      {/* Clinic Name */}
      <form.Field name="clinicName">
        {(field) => (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Qual é o nome da sua clínica? *
            </label>
            <input
              type="text"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Ex: Clínica Saúde Total"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        )}
      </form.Field>

      {/* Address Section */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <h3 className="font-semibold text-gray-800">Endereço Completo</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <form.Field name="address.street">
            {(field) => (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rua *</label>
                <input
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Nome da rua"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="address.number">
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Número *</label>
                <input
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="123"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="address.neighborhood">
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bairro *</label>
                <input
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Centro"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="address.city">
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cidade *</label>
                <input
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="São Paulo"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="address.state">
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado *</label>
                <input
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="SP"
                  maxLength={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="address.cep">
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CEP *</label>
                <input
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="12345-678"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            )}
          </form.Field>
        </div>
      </div>

      {/* Operating Hours */}
      <form.Field name="weekdayHours">
        {(field) => (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quais são os horários de funcionamento durante a semana (segunda a sexta)? *
            </label>
            <input
              type="text"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Ex: 8h às 18h"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        )}
      </form.Field>

      {/* Lunch Break */}
      <form.Field name="lunchBreak">
        {(field) => (
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={field.state.value}
              onChange={(e) => field.handleChange(e.target.checked)}
              className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-gray-700">
              A clínica fecha para almoço?
            </label>
          </div>
        )}
      </form.Field>

      <form.Field name="lunchBreak">
        {(lunchBreakField) => (
          lunchBreakField.state.value && (
            <form.Field name="lunchBreakTime">
              {(field) => (
                <div className="ml-7">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Em qual horário?
                  </label>
                  <input
                    type="text"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Ex: 12h às 13h"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              )}
            </form.Field>
          )
        )}
      </form.Field>

      {/* Weekend/Holidays */}
      <form.Field name="weekendHolidays">
        {(field) => (
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={field.state.value}
              onChange={(e) => field.handleChange(e.target.checked)}
              className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-gray-700">
              A clínica funciona em sábados, domingos e feriados?
            </label>
          </div>
        )}
      </form.Field>

      <form.Field name="weekendHolidays">
        {(weekendField) => (
          weekendField.state.value && (
            <form.Field name="weekendHolidayHours">
              {(field) => (
                <div className="ml-7">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horários de funcionamento (finais de semana/feriados)
                  </label>
                  <input
                    type="text"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Ex: Sábado 8h às 12h"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              )}
            </form.Field>
          )
        )}
      </form.Field>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <form.Field name="phone">
          {(field) => (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone principal (fixo) *
              </label>
              <input
                type="tel"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="(11) 1234-5678"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          )}
        </form.Field>

        <form.Field name="whatsapp">
          {(field) => (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp *
              </label>
              <input
                type="tel"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="(11) 91234-5678"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          )}
        </form.Field>
      </div>

      <form.Field name="email">
        {(field) => (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-mail oficial de atendimento *
            </label>
            <input
              type="email"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="contato@clinica.com.br"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        )}
      </form.Field>

      <form.Field name="website">
        {(field) => (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site da clínica (opcional)
            </label>
            <input
              type="url"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="https://www.clinica.com.br"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        )}
      </form.Field>
    </div>
  )
}
