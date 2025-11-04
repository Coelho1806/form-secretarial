# Google OAuth Token API para n8n Workflows

## 🎯 Visão Geral

API para obter tokens OAuth do Google através do Chatwoot Account ID para uso em workflows do n8n.

## 📋 Pré-requisitos

1. **Migration do Banco de Dados**
   ```bash
   # Execute a migration para adicionar o campo chatwoot_account_id
   psql $DATABASE_URL -f database/migration_add_chatwoot_account_id.sql
   ```

2. **Configurar Chatwoot Account ID**
   - Acesse o Admin Panel: `http://localhost:5173/?admin=true`
   - Ao criar ou editar um cliente, adicione o **Chatwoot Account ID**
   - Este ID será usado pelo n8n para buscar o token

## 🔌 Endpoint da API

### POST `/api/oauth/google-token-chatwoot`

Retorna o token OAuth do Google para um cliente específico usando o Chatwoot Account ID.

**Request:**
```json
{
  "chatwootAccountId": "12345"
}
```

**Response (Success):**
```json
{
  "success": true,
  "access_token": "ya29.a0AfB_byC...",
  "expires_at": 1699999999,
  "scopes": "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive",
  "provider": "google",
  "chatwootAccountId": "12345",
  "clientId": "clinica-exemplo",
  "clientName": "Clínica Exemplo",
  "email": "clinica@exemplo.com"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Client not found",
  "message": "No client found for Chatwoot Account ID: 12345"
}
```

## 🔧 Uso no n8n

### 1. HTTP Request Node

Configure o nó HTTP Request no seu workflow:

```
Method: POST
URL: https://seu-dominio.com/api/oauth/google-token-chatwoot
Body Content Type: JSON

Body:
{
  "chatwootAccountId": "{{ $json.account_id }}"
}
```

### 2. Exemplo de Workflow Completo

```
Trigger (Webhook Chatwoot)
  ↓
HTTP Request (Get Google Token)
  ↓
Set (Extract Access Token)
  ↓
Google Calendar Node (usando token)
```

### 3. Código do Set Node

```javascript
// Extrair o access token da resposta
return {
  json: {
    googleToken: $json.access_token,
    expiresAt: $json.expires_at,
    clientId: $json.clientId,
    // Seus outros dados...
  }
}
```

### 4. Usar Token no Google Calendar/Drive/etc

No nó do Google (Calendar, Drive, Tasks, Gmail):

**Authentication:** OAuth2
**Access Token:** `{{ $json.googleToken }}`

Ou use diretamente no header HTTP:
```
Authorization: Bearer {{ $json.googleToken }}
```

## 📊 Fluxo de Dados

```
Chatwoot → n8n Workflow
                ↓
    POST /api/oauth/google-token-chatwoot
                ↓
    Busca Cliente no DB (por chatwoot_account_id)
                ↓
    Obtém Clerk User ID do Cliente
                ↓
    Busca Token OAuth no Clerk
                ↓
    Retorna Token (auto-renovado pelo Clerk)
                ↓
    n8n usa Token para acessar Google APIs
```

## 🔐 Segurança

- ✅ Token é automaticamente renovado pelo Clerk quando expira
- ✅ Apenas clientes com Google conectado podem obter tokens
- ✅ Cliente deve estar linkado a um Clerk User ID
- ✅ Token tem scopes específicos configurados no Clerk

## 🛠️ Troubleshooting

### Erro: "Client not found"
- Verifique se o Chatwoot Account ID está correto no Admin Panel
- Confirme que o cliente existe no banco de dados

### Erro: "Client not linked to user"
- O usuário precisa fazer login com Google no formulário (Step 4)
- Isso cria o link entre o cliente e o Clerk User ID

### Erro: "Google account not connected"
- Usuário precisa conectar a conta Google no formulário
- Acesse o formulário: `https://seu-dominio.com/?client=ID_DO_CLIENTE`
- Complete o Step 4 (Integrações) e conecte o Google

### Erro: "Failed to get access token"
- Token pode ter sido revogado pelo usuário
- Reconecte a conta Google pelo formulário

## 📝 Exemplo de Teste com cURL

```bash
# Testar o endpoint
curl -X POST http://localhost:3001/api/oauth/google-token-chatwoot \
  -H "Content-Type: application/json" \
  -d '{"chatwootAccountId": "12345"}'

# Exemplo de resposta
{
  "success": true,
  "access_token": "ya29.xxx...",
  "expires_at": 1699999999,
  "scopes": "https://www.googleapis.com/auth/calendar ...",
  "provider": "google",
  "chatwootAccountId": "12345",
  "clientId": "clinica-exemplo",
  "clientName": "Clínica Exemplo",
  "email": "clinica@exemplo.com"
}
```

## 🎯 Endpoints Disponíveis

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/oauth/google-token-chatwoot` | POST | Busca token por Chatwoot Account ID |
| `/api/oauth/google-token` | POST | Busca token por Client ID (legacy) |
| `/api/oauth/google-token/:userId` | GET | Busca token por Clerk User ID (protegido) |

## 📚 Documentação Adicional

- [Clerk OAuth Documentation](https://clerk.com/docs/authentication/social-connections/google)
- [Google OAuth Scopes](https://developers.google.com/identity/protocols/oauth2/scopes)
- [n8n HTTP Request Node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/)

---

**Última Atualização:** 2025-11-04
**Versão:** 1.0.0
