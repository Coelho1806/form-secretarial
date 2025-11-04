# ✅ Implementação Completa: Google OAuth Token API para n8n

## 📦 O que foi implementado

### 1. **Migration do Banco de Dados** ✅
- Arquivo: `database/migration_add_chatwoot_account_id.sql`
- Adiciona campo `chatwoot_account_id` na tabela `clients`
- Cria índice para busca rápida

### 2. **Função de Busca no Banco** ✅
- Arquivo: `src/lib/db.js`
- Nova função: `getClientByChatwootId(chatwootAccountId)`
- Atualização de `createClient()` e `updateClient()` para incluir `chatwootAccountId`

### 3. **Server Functions (TanStack Start)** ✅
- Arquivo: `src/server/google-oauth.ts`
- `getGoogleTokenByChatwoot()` - Busca token por Chatwoot ID
- Pronto para uso com TanStack Start (quando migrar do Express)

### 4. **REST API Endpoint** ✅
- Arquivo: `server.js`
- `POST /api/oauth/google-token-chatwoot`
- Aceita `{ "chatwootAccountId": "12345" }`
- Retorna token OAuth do Google + informações do cliente

### 5. **Admin Panel - Interface** ✅
- Arquivo: `src/pages/AdminPanel.tsx`
- Campo "Chatwoot Account ID" no formulário de criar/editar cliente
- Integrado com o banco de dados

### 6. **Documentação** ✅
- `N8N_GOOGLE_TOKEN_API.md` - Guia completo de uso
- `test-google-token-api.sh` - Script de teste

## 🚀 Como usar

### Passo 1: Executar Migration
```bash
psql postgresql://lucascc@localhost:5432/formulario_secretaria \
  -f database/migration_add_chatwoot_account_id.sql
```

### Passo 2: Configurar Cliente no Admin Panel
1. Acesse: `http://localhost:5173/?admin=true`
2. Criar/Editar cliente
3. Preencher campo **"Chatwoot Account ID"**
4. Salvar

### Passo 3: Cliente Conecta Google
1. Cliente acessa formulário: `http://localhost:5173/?client=ID_DO_CLIENTE`
2. Step 4: Integrações
3. Clica em "Entrar com Google e Autorizar Serviços"
4. Autoriza Calendar, Drive, Tasks, Gmail

### Passo 4: Usar no n8n
```javascript
// HTTP Request Node
POST https://seu-dominio.com/api/oauth/google-token-chatwoot
Body: {
  "chatwootAccountId": "{{ $json.account_id }}"
}

// Response
{
  "success": true,
  "access_token": "ya29.xxx...",
  "expires_at": 1699999999,
  "scopes": "...",
  "clientId": "clinica-exemplo",
  "email": "clinica@exemplo.com"
}
```

## 📊 Fluxo Completo

```
Admin Panel
    ↓
Configura Chatwoot ID no cliente
    ↓
Cliente preenche formulário
    ↓
Cliente conecta Google (OAuth via Clerk)
    ↓
n8n Workflow recebe webhook do Chatwoot
    ↓
n8n faz POST /api/oauth/google-token-chatwoot
    ↓
API busca cliente por Chatwoot ID
    ↓
API obtém token do Clerk (auto-renovado)
    ↓
n8n usa token nas Google APIs
```

## 🧪 Testar

```bash
# Inicie o servidor
npm run dev

# Em outro terminal, teste o endpoint
./test-google-token-api.sh

# Ou com curl direto
curl -X POST http://localhost:3001/api/oauth/google-token-chatwoot \
  -H "Content-Type: application/json" \
  -d '{"chatwootAccountId": "12345"}'
```

## 📝 Arquivos Modificados

1. `database/migration_add_chatwoot_account_id.sql` - **NEW**
2. `src/lib/db.js` - Adicionado `getClientByChatwootId()` e campos `chatwootAccountId`
3. `src/server/google-oauth.ts` - **NEW** - Server functions
4. `server.js` - Adicionado endpoint `/api/oauth/google-token-chatwoot`
5. `src/pages/AdminPanel.tsx` - Campo Chatwoot Account ID no formulário
6. `N8N_GOOGLE_TOKEN_API.md` - **NEW** - Documentação
7. `test-google-token-api.sh` - **NEW** - Script de teste

## ⚡ Próximos Passos

1. **Executar Migration** (obrigatório)
2. **Reiniciar servidor** para carregar mudanças
3. **Adicionar Chatwoot ID** nos clientes existentes
4. **Testar endpoint** com o script fornecido
5. **Integrar com n8n** seguindo a documentação

## 🎯 Endpoints Disponíveis

| Endpoint | Método | Input | Uso |
|----------|--------|-------|-----|
| `/api/oauth/google-token-chatwoot` | POST | `chatwootAccountId` | **n8n workflows** 🎯 |
| `/api/oauth/google-token` | POST | `clientId` | Legacy (ainda funciona) |
| `/api/oauth/google-token/:userId` | GET | `userId` (URL) | Admin/Debug |

## 💡 Dicas

- **Token expira?** Não se preocupe! Clerk renova automaticamente
- **Múltiplos clientes?** Cada cliente tem seu próprio Chatwoot ID
- **Segurança?** Token só é retornado se cliente estiver linkado a usuário autenticado
- **Debugar?** Veja logs no terminal do servidor

---

✅ **Implementação Completa e Pronta para Uso!**
