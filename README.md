# 🎉 Form Secretarial - Sistema de Onboarding de Clínicas

Sistema completo para onboarding de clínicas com integração Google OAuth, Chatwoot e n8n workflows.

## 🚀 Quick Start

```bash
# 1. Instalar dependências
npm install

# 2. Configurar banco de dados
psql $DATABASE_URL -f database/schema.sql
psql $DATABASE_URL -f database/migration_add_drafts.sql
psql $DATABASE_URL -f database/migration_add_clerk_user_id.sql
psql $DATABASE_URL -f database/migration_add_chatwoot_account_id.sql

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais

# 4. Iniciar desenvolvimento
npm run dev
```

## ✨ Features

### 📋 Formulário Multi-Step
- ✅ Informações da clínica
- ✅ Profissionais e especialidades
- ✅ Formas de pagamento e convênios
- ✅ Integrações (Google OAuth, Telegram)
- ✅ Auto-save e recuperação de progresso

### 🔐 Autenticação
- ✅ Google OAuth via Clerk
- ✅ Múltiplos scopes (Calendar, Drive, Tasks, Gmail)
- ✅ Token auto-renovado
- ✅ Gerenciamento de sessões

### 🔌 Integrações
- ✅ **Chatwoot** - Account ID linking
- ✅ **n8n** - Workflow automation
- ✅ **Google Calendar** - Event management
- ✅ **Google Drive** - File storage
- ✅ **Google Tasks** - Task management
- ✅ **Gmail** - Email integration
- ✅ **Telegram** - Bot notifications

### �� Admin Panel
- ✅ Gerenciamento de clientes
- ✅ Visualização de submissões
- ✅ Estatísticas e analytics
- ✅ Geração de prompts com IA
- ✅ Export de dados

### 🔄 API para n8n
- ✅ `POST /api/oauth/google-token-chatwoot` - Get Google token by Chatwoot ID
- ✅ Auto token refresh
- ✅ Complete error handling
- ✅ Scopes validation

## 🏗️ Tech Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool
- **TanStack Router** - Routing
- **TanStack Form** - Form management
- **Tailwind CSS** - Styling
- **Clerk** - Authentication

### Backend
- **Express.js** - API server
- **PostgreSQL** - Database
- **Clerk Backend** - OAuth management
- **OpenAI** - Prompt generation

### Infrastructure
- **n8n** - Workflow automation
- **Chatwoot** - Customer communication
- **Google OAuth 2.0** - API access

## 📚 Documentação

| Arquivo | Descrição |
|---------|-----------|
| [README_CHATWOOT_INTEGRATION.md](README_CHATWOOT_INTEGRATION.md) | 👈 **Guia completo de integração** |
| [N8N_GOOGLE_TOKEN_API.md](N8N_GOOGLE_TOKEN_API.md) | API para obter tokens Google |
| [IMPLEMENTATION_CHATWOOT_TOKEN.md](IMPLEMENTATION_CHATWOOT_TOKEN.md) | Detalhes técnicos |
| [TEST_RESULTS.md](TEST_RESULTS.md) | Resultados dos testes |
| [FINAL_SUMMARY.md](FINAL_SUMMARY.md) | Resumo da implementação |

## 🔧 Configuração

### 1. Variáveis de Ambiente

```env
# Database
DATABASE_URL=postgresql://user@localhost:5432/database_name

# Clerk
CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx

# OpenAI (opcional - para geração de prompts)
OPENAI_API_KEY=sk-xxx
```

### 2. Database Setup

```bash
# Criar database
createdb formulario_secretaria

# Executar migrations
./setup-chatwoot-integration.sh
```

### 3. Clerk Setup

1. Criar conta em [clerk.com](https://clerk.com)
2. Criar nova aplicação
3. Configurar Google OAuth provider
4. Adicionar scopes:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/drive`
   - `https://www.googleapis.com/auth/tasks`
   - `https://www.googleapis.com/auth/gmail.modify`
5. Copiar chaves para `.env`

## 🧪 Testes

```bash
# Testar API
./test-google-token-api.sh

# Testar servidor
npm run server

# Testar cliente
npm run client
```

## 📊 Estrutura do Projeto

```
├── database/               # SQL schemas e migrations
├── src/
│   ├── components/        # React components
│   ├── pages/             # Páginas principais
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── lib/               # Utilities
│   └── server/            # Server functions (TanStack Start)
├── public/                # Static assets
├── server.js              # Express server
└── *.md                   # Documentação

72 files, 20.7k lines of code
```

## 🎯 Fluxo de Uso

### Para Admin:
1. Acesse `http://localhost:5173/?admin=true`
2. Crie novo cliente
3. Adicione Chatwoot Account ID
4. Copie link do formulário
5. Envie para cliente

### Para Cliente:
1. Acesse link do formulário
2. Preencha informações (5 steps)
3. Conecte Google OAuth (Step 4)
4. Finalize o cadastro

### Para n8n:
1. Configure webhook do Chatwoot
2. Adicione HTTP Request node
3. Use endpoint `/api/oauth/google-token-chatwoot`
4. Extraia `access_token`
5. Use nas Google APIs

## 🔌 Endpoints Principais

### Client Management
- `GET /api/clients` - Listar clientes
- `POST /api/clients` - Criar cliente
- `PUT /api/clients/:id` - Atualizar cliente
- `DELETE /api/clients/:id` - Deletar cliente

### Submissions
- `GET /api/submissions` - Listar submissões
- `POST /api/submissions` - Criar submissão
- `GET /api/submissions?clientId=xxx` - Por cliente

### OAuth Tokens
- `POST /api/oauth/google-token-chatwoot` - **Token por Chatwoot ID**
- `POST /api/oauth/google-token` - Token por Client ID
- `GET /api/oauth/google-token/:userId` - Token por User ID

### Stats
- `GET /api/stats` - Estatísticas gerais

## 🛠️ Scripts

```bash
# Desenvolvimento
npm run dev              # Inicia servidor + cliente
npm run server           # Apenas servidor
npm run client           # Apenas cliente

# Build
npm run build            # Build para produção

# Testes
./test-google-token-api.sh           # Testa API de tokens
./setup-chatwoot-integration.sh     # Setup completo
```

## 🔐 Segurança

- ✅ Tokens OAuth auto-renovados
- ✅ Validação de scopes
- ✅ CORS configurado
- ✅ Sanitização de inputs
- ✅ Rate limiting (recomendado adicionar)
- ✅ HTTPS em produção (obrigatório)

## 🚀 Deploy

### Requisitos:
- Node.js 18+
- PostgreSQL 12+
- Clerk account
- Google Cloud project

### Recomendações:
- **Frontend**: Vercel, Netlify
- **Backend**: Railway, Render, Fly.io
- **Database**: Supabase, Neon, Railway
- **n8n**: Self-hosted ou n8n.cloud

## 📝 Roadmap

- [ ] Suporte a múltiplos idiomas
- [ ] Dashboard de analytics avançado
- [ ] Notificações em tempo real
- [ ] Mobile app
- [ ] API webhooks
- [ ] Rate limiting
- [ ] Logs estruturados
- [ ] Monitoramento (Sentry)

## �� Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/amazing`)
3. Commit suas mudanças (`git commit -m 'Add amazing feature'`)
4. Push para a branch (`git push origin feature/amazing`)
5. Abra um Pull Request

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes

## 🙏 Agradecimentos

- [Clerk](https://clerk.com) - Authentication
- [TanStack](https://tanstack.com) - React libraries
- [Vite](https://vitejs.dev) - Build tool
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [n8n](https://n8n.io) - Workflow automation

## 📞 Suporte

- **Issues**: [GitHub Issues](https://github.com/Coelho1806/form-secretarial/issues)
- **Email**: lucascoelho1806@gmail.com
- **Documentação**: Veja arquivos `.md` no repositório

---

**Status**: ✅ Production Ready  
**Versão**: 1.0.0  
**Última atualização**: 2025-11-04

🎉 **Sistema completo e funcionando!** 🚀
