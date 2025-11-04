const API_BASE = '/api'

export async function getClientConfig(clientId) {
  try {
    const response = await fetch(`${API_BASE}/clients/${clientId}`)
    
    if (!response.ok) {
      return {
        error: true,
        message: 'Cliente não encontrado. Verifique o link de acesso.',
      }
    }
    
    const data = await response.json()
    return {
      error: false,
      ...data.client,
    }
  } catch (error) {
    console.error('Error fetching client config:', error)
    return {
      error: true,
      message: 'Erro ao carregar configurações do cliente.',
    }
  }
}

export async function getAllClients() {
  try {
    const response = await fetch(`${API_BASE}/clients`)
    if (!response.ok) throw new Error('Failed to fetch clients')
    const data = await response.json()
    
    // Convert array to object with id as key for backward compatibility
    const clientsObj = {}
    data.clients.forEach(client => {
      clientsObj[client.id] = client
    })
    return clientsObj
  } catch (error) {
    console.error('Error fetching clients:', error)
    return {}
  }
}

export async function getAllClientIds() {
  const clients = await getAllClients()
  return Object.keys(clients)
}

export async function addClient(clientId, config) {
  try {
    const response = await fetch(`${API_BASE}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, ...config }),
    })
    
    if (!response.ok) throw new Error('Failed to create client')
    return await response.json()
  } catch (error) {
    console.error('Error creating client:', error)
    throw error
  }
}

export async function updateClient(clientId, config) {
  try {
    const response = await fetch(`${API_BASE}/clients/${clientId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    })
    
    if (!response.ok) throw new Error('Failed to update client')
    return true
  } catch (error) {
    console.error('Error updating client:', error)
    return false
  }
}

export async function deleteClient(clientId) {
  try {
    const response = await fetch(`${API_BASE}/clients/${clientId}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) throw new Error('Failed to delete client')
    return true
  } catch (error) {
    console.error('Error deleting client:', error)
    return false
  }
}

export async function submitForm(clientId, formData) {
  try {
    const response = await fetch(`${API_BASE}/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, ...formData }),
    })
    
    if (!response.ok) throw new Error('Failed to submit form')
    return await response.json()
  } catch (error) {
    console.error('Error submitting form:', error)
    throw error
  }
}

export async function getStats() {
  try {
    const response = await fetch(`${API_BASE}/stats`)
    if (!response.ok) throw new Error('Failed to fetch stats')
    return await response.json()
  } catch (error) {
    console.error('Error fetching stats:', error)
    return null
  }
}

export async function saveDraft(clientId, formData, currentStep) {
  try {
    const response = await fetch(`${API_BASE}/drafts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, formData, currentStep }),
    })
    
    if (!response.ok) throw new Error('Failed to save draft')
    return await response.json()
  } catch (error) {
    console.error('Error saving draft:', error)
    throw error
  }
}

export async function getDraft(clientId) {
  try {
    const response = await fetch(`${API_BASE}/drafts/${clientId}`)
    
    if (response.status === 404) {
      return null // No draft found
    }
    
    if (!response.ok) throw new Error('Failed to fetch draft')
    const data = await response.json()
    return data.draft
  } catch (error) {
    console.error('Error fetching draft:', error)
    return null
  }
}

export async function deleteDraft(clientId) {
  try {
    const response = await fetch(`${API_BASE}/drafts/${clientId}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) throw new Error('Failed to delete draft')
    return true
  } catch (error) {
    console.error('Error deleting draft:', error)
    return false
  }
}

export async function getClientSubmissions(clientId) {
  try {
    const response = await fetch(`${API_BASE}/submissions?clientId=${clientId}`)
    if (!response.ok) throw new Error('Failed to fetch submissions')
    const data = await response.json()
    return data.submissions || []
  } catch (error) {
    console.error('Error fetching client submissions:', error)
    return []
  }
}
