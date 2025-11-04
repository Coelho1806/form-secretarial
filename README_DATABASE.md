# Configuração do Banco de Dados PostgreSQL

## Pré-requisitos

- PostgreSQL instalado localmente ou acesso a um servidor PostgreSQL (como Supabase, Neon, Railway, etc.)
- Node.js e npm instalados

## Passos para Configuração

### 1. Criar o Banco de Dados

Se estiver usando PostgreSQL local:

```bash
# Conectar ao PostgreSQL
psql -U postgres

# Criar o banco de dados
CREATE DATABASE formulario_secretaria;

# Sair
\q
```

### 2. Executar o Schema

Execute o arquivo SQL para criar as tabelas:

```bash
psql -U postgres -d formulario_secretaria -f database/schema.sql
```

Ou se preferir, conecte-se ao banco e execute manualmente:

```bash
psql -U postgres -d formulario_secretaria
# Copie e cole o conteúdo de database/schema.sql
```

### 3. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure sua connection string:

```env
DATABASE_URL=postgresql://postgres:sua_senha@localhost:5432/formulario_secretaria
```

**Exemplos de connection strings:**

- **Local:** `postgresql://postgres:password@localhost:5432/formulario_secretaria`
- **Supabase:** `postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres`
- **Neon:** `postgresql://[USER]:[PASSWORD]@[HOST].neon.tech/[DATABASE]?sslmode=require`
- **Railway:** Copie a connection string do painel do Railway

### 4. Instalar Dependências

```bash
npm install
```

### 5. Executar o Servidor

```bash
npm run dev
```

## Estrutura do Banco de Dados

### Tabela `clients`

Armazena os clientes que podem usar o formulário:

- `id`: ID único do cliente (usado na URL)
- `name`: Nome da clínica
- `google_calendar_oauth_url`: URL de autenticação OAuth do Google Calendar
- `google_drive_oauth_url`: URL de autenticação OAuth do Google Drive
- `google_tasks_oauth_url`: URL de autenticação OAuth do Google Tasks
- `google_gmail_oauth_url`: URL de autenticação OAuth do Gmail
- `telegram_bot_token`: Token do bot do Telegram
- `telegram_id`: ID do Telegram
- `created_at`: Data de criação
- `updated_at`: Data de atualização

### Tabela `form_submissions`

Armazena as submissões dos formulários:

- `id`: ID auto-incremental
- `client_id`: Referência ao cliente
- Campos de informações da clínica (nome, endereço, horários, contato)
- `professionals`: Array JSON de profissionais
- `payment_methods`: Array JSON de métodos de pagamento
- `insurance_list`: Array JSON de convênios aceitos
- `created_at`: Data de submissão
- `updated_at`: Data de atualização

## API Endpoints

### Clientes

- `GET /api/clients` - Lista todos os clientes
- `POST /api/clients` - Cria um novo cliente
- `GET /api/clients/:id` - Obtém um cliente específico
- `PUT /api/clients/:id` - Atualiza um cliente
- `DELETE /api/clients/:id` - Deleta um cliente

### Submissões

- `GET /api/submissions` - Lista todas as submissões
- `POST /api/submissions` - Cria uma nova submissão

### Estatísticas

- `GET /api/stats` - Obtém estatísticas do dashboard

## Migração de Dados do localStorage

Se você já tem dados no localStorage, pode exportá-los do navegador e importar manualmente para o PostgreSQL usando queries INSERT.

## Troubleshooting

### Erro de Conexão com o Banco

- Verifique se o PostgreSQL está rodando
- Confirme que a connection string está correta
- Teste a conexão com `psql`

### Tabelas não foram criadas

- Execute o arquivo `database/schema.sql` novamente
- Verifique se há erros no console

### Permissões

Se houver erro de permissões, garanta que o usuário do PostgreSQL tem as permissões necessárias:

```sql
GRANT ALL PRIVILEGES ON DATABASE formulario_secretaria TO seu_usuario;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO seu_usuario;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO seu_usuario;
```

## Backup e Restore

### Fazer Backup

```bash
pg_dump -U postgres formulario_secretaria > backup.sql
```

### Restaurar Backup

```bash
psql -U postgres formulario_secretaria < backup.sql
```
