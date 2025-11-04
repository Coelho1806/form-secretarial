import pkg from 'pg'
const { Pool } = pkg

let pool = null

export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })
  }
  return pool
}

export async function resetPool() {
  if (pool) {
    await pool.end()
    pool = null
  }
}

export async function query(text, params) {
  const pool = getPool()
  try {
    const result = await pool.query(text, params)
    return result
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

// Client functions
export async function getAllClients() {
  const result = await query('SELECT * FROM clients ORDER BY created_at DESC')
  return result.rows.map(row => ({
    id: row.id,
    name: row.name,
    clerkUserId: row.clerk_user_id,
    chatwootAccountId: row.chatwoot_account_id,
    googleCalendarOAuthUrl: row.google_calendar_oauth_url,
    googleDriveOAuthUrl: row.google_drive_oauth_url,
    googleTasksOAuthUrl: row.google_tasks_oauth_url,
    googleGmailOAuthUrl: row.google_gmail_oauth_url,
    telegramBotToken: row.telegram_bot_token,
    telegramId: row.telegram_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}

export async function getClientById(clientId) {
  const result = await query('SELECT * FROM clients WHERE id = $1', [clientId])
  if (result.rows.length === 0) return null
  
  const row = result.rows[0]
  return {
    id: row.id,
    name: row.name,
    clerkUserId: row.clerk_user_id,
    chatwootAccountId: row.chatwoot_account_id,
    googleCalendarOAuthUrl: row.google_calendar_oauth_url,
    googleDriveOAuthUrl: row.google_drive_oauth_url,
    googleTasksOAuthUrl: row.google_tasks_oauth_url,
    googleGmailOAuthUrl: row.google_gmail_oauth_url,
    telegramBotToken: row.telegram_bot_token,
    telegramId: row.telegram_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getClientByChatwootId(chatwootAccountId) {
  const result = await query('SELECT * FROM clients WHERE chatwoot_account_id = $1', [chatwootAccountId])
  if (result.rows.length === 0) return null
  
  const row = result.rows[0]
  return {
    id: row.id,
    name: row.name,
    clerkUserId: row.clerk_user_id,
    chatwootAccountId: row.chatwoot_account_id,
    googleCalendarOAuthUrl: row.google_calendar_oauth_url,
    googleDriveOAuthUrl: row.google_drive_oauth_url,
    googleTasksOAuthUrl: row.google_tasks_oauth_url,
    googleGmailOAuthUrl: row.google_gmail_oauth_url,
    telegramBotToken: row.telegram_bot_token,
    telegramId: row.telegram_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function createClient(clientId, data) {
  const result = await query(
    `INSERT INTO clients (id, name, clerk_user_id, chatwoot_account_id, google_oauth_url, google_calendar_oauth_url, google_drive_oauth_url, google_tasks_oauth_url, google_gmail_oauth_url, telegram_bot_token, telegram_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [
      clientId,
      data.name,
      data.clerkUserId || null,
      data.chatwootAccountId || null,
      null, // google_oauth_url (deprecated, kept for backward compatibility)
      data.googleCalendarOAuthUrl || null,
      data.googleDriveOAuthUrl || null,
      data.googleTasksOAuthUrl || null,
      data.googleGmailOAuthUrl || null,
      data.telegramBotToken || null,
      data.telegramId || null,
    ]
  )
  return result.rows[0]
}

export async function updateClient(clientId, data) {
  const result = await query(
    `UPDATE clients 
     SET name = $2, clerk_user_id = $3, chatwoot_account_id = $4, google_calendar_oauth_url = $5, google_drive_oauth_url = $6, google_tasks_oauth_url = $7, google_gmail_oauth_url = $8, telegram_bot_token = $9, telegram_id = $10
     WHERE id = $1
     RETURNING *`,
    [
      clientId,
      data.name,
      data.clerkUserId || null,
      data.chatwootAccountId || null,
      data.googleCalendarOAuthUrl || null,
      data.googleDriveOAuthUrl || null,
      data.googleTasksOAuthUrl || null,
      data.googleGmailOAuthUrl || null,
      data.telegramBotToken || null,
      data.telegramId || null,
    ]
  )
  return result.rows[0]
}

export async function deleteClient(clientId) {
  await query('DELETE FROM clients WHERE id = $1', [clientId])
}

// Form submission functions
export async function createFormSubmission(clientId, formData) {
  const result = await query(
    `INSERT INTO form_submissions (
      client_id, clinic_name, address_street, address_number, address_neighborhood,
      address_city, address_state, address_cep, weekday_hours, lunch_break,
      lunch_break_time, weekend_holidays, weekend_holiday_hours, phone, whatsapp,
      email, website, professionals, payment_methods, accepts_insurance,
      insurance_list, google_oauth, whatsapp_qr_code, telegram_id, telegram_bot_token
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
    RETURNING *`,
    [
      clientId,
      formData.clinicName,
      formData.address?.street,
      formData.address?.number,
      formData.address?.neighborhood,
      formData.address?.city,
      formData.address?.state,
      formData.address?.cep,
      formData.weekdayHours,
      formData.lunchBreak || false,
      formData.lunchBreakTime,
      formData.weekendHolidays || false,
      formData.weekendHolidayHours,
      formData.phone,
      formData.whatsapp,
      formData.email,
      formData.website,
      JSON.stringify(formData.professionals || []),
      JSON.stringify(formData.paymentMethods || []),
      formData.acceptsInsurance || false,
      JSON.stringify(formData.insuranceList || []),
      formData.googleOAuth,
      formData.whatsappQRCode,
      formData.telegramId,
      formData.telegramBotToken,
    ]
  )
  return result.rows[0]
}

export async function getFormSubmissionsByClient(clientId) {
  const result = await query(
    'SELECT * FROM form_submissions WHERE client_id = $1 ORDER BY created_at DESC',
    [clientId]
  )
  return result.rows
}

export async function getAllFormSubmissions() {
  const result = await query(
    'SELECT * FROM form_submissions ORDER BY created_at DESC'
  )
  return result.rows
}

export async function updateFormSubmission(submissionId, updates) {
  const fields = []
  const values = [submissionId]
  let paramIndex = 2

  if (updates.adapted_prompt !== undefined) {
    fields.push(`adapted_prompt = $${paramIndex++}`)
    values.push(updates.adapted_prompt)
  }

  if (fields.length === 0) {
    throw new Error('No fields to update')
  }

  const sql = `UPDATE form_submissions SET ${fields.join(', ')} WHERE id = $1 RETURNING *`;
  console.log('[db] Executing SQL:', sql);
  console.log('[db] With values:', values);
  
  const result = await query(sql, values)
  
  return result.rows[0]
}

export async function getSubmissionStats() {
  const result = await query(`
    SELECT 
      COUNT(*) as total_submissions,
      COUNT(DISTINCT client_id) as unique_clients,
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as last_7_days,
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as last_30_days
    FROM form_submissions
  `)
  return result.rows[0]
}

export async function getClientStats() {
  const result = await query(`
    SELECT 
      c.id,
      c.name,
      COUNT(fs.id) as submission_count,
      MAX(fs.created_at) as last_submission
    FROM clients c
    LEFT JOIN form_submissions fs ON c.id = fs.client_id
    GROUP BY c.id, c.name
    ORDER BY submission_count DESC
  `)
  return result.rows
}

// Draft submission functions
export async function saveDraft(clientId, formData, currentStep) {
  const result = await query(
    `INSERT INTO draft_submissions (client_id, form_data, current_step)
     VALUES ($1, $2, $3)
     ON CONFLICT (client_id) 
     DO UPDATE SET form_data = $2, current_step = $3, updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [clientId, JSON.stringify(formData), currentStep]
  )
  return result.rows[0]
}

export async function getDraft(clientId) {
  const result = await query(
    'SELECT * FROM draft_submissions WHERE client_id = $1',
    [clientId]
  )
  if (result.rows.length === 0) return null
  
  const row = result.rows[0]
  return {
    id: row.id,
    clientId: row.client_id,
    formData: row.form_data,
    currentStep: row.current_step,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function deleteDraft(clientId) {
  await query('DELETE FROM draft_submissions WHERE client_id = $1', [clientId])
}
