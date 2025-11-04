# Formulário Secretária - Client Onboarding Portal

A multi-tenant onboarding portal for clinic assistants with integrated OAuth authentication and n8n workflow support.

## 🚀 Features

- **Multi-tenant Architecture**: Each clinic gets a unique portal URL
- **Multi-step Form**: Guided onboarding with 5 comprehensive steps
- **OAuth Authentication**: Secure Google OAuth via Clerk (Calendar, Drive, Tasks, Gmail)
- **Automatic Token Management**: No manual token refresh logic needed
- **n8n Integration**: Simple API for workflows to fetch fresh Google tokens
- **Draft Saving**: Clients can save progress and return later
- **Admin Dashboard**: Manage clients and view submissions
- **PostgreSQL Database**: Reliable data storage

## 📚 Documentation

- **[Clerk OAuth Setup Guide](./CLERK_OAUTH_SETUP.md)** - Complete setup instructions for Clerk authentication
- **[n8n Integration Guide](./N8N_INTEGRATION_GUIDE.md)** - How to use the token API in your n8n workflows
- **[Database Documentation](./README_DATABASE.md)** - Database schema and migrations

## 🎯 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Clerk account (free tier available)
- Google Cloud Console project (for OAuth)

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Set up your environment variables (`.env`):
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/formulario_secretaria

# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key
CLERK_SECRET_KEY=sk_test_your_key

# OpenAI (optional)
OPENAI_API_KEY=your_openai_key
```

3. Run database migrations:
```bash
# Run the schema setup
node -e "import('./src/lib/db.js').then(db => db.query(require('fs').readFileSync('./database/schema.sql', 'utf8')))"
```

4. Start the development servers:
```bash
npm run dev
```

This starts:
- Frontend (Vite): http://localhost:5173
- Backend API: http://localhost:3001

## 🏗️ Architecture

### Client Portal Flow
```
User visits → Clerk Auth → Multi-step Form → Google OAuth → Submit → n8n Automation
```

### Token Management Flow
```
n8n Workflow → POST /api/oauth/google-token → Clerk API → Fresh Token → Google API
```

**Key Innovation:** Clerk handles all token storage, expiry checking, and refresh logic. Your n8n workflows just request a token and use it!

## 🔧 Configuration

### Set Up a New Client

1. Visit the Admin Panel: `http://localhost:5173/admin`
2. Click "Novo Cliente"
3. Enter:
   - Client ID: `clinic-xyz` (used in URL)
   - Client Name: `Clínica XYZ`
4. Share the portal URL: `http://yourapp.com?client=clinic-xyz`

### Configure Google OAuth in Clerk

See the [Clerk OAuth Setup Guide](./CLERK_OAUTH_SETUP.md) for detailed instructions.

Quick steps:
1. Go to Clerk Dashboard → Social Connections
2. Enable Google
3. Add required scopes (Calendar, Drive, Gmail, Tasks)
4. Save configuration

## 🔐 API Endpoints

### For n8n Workflows

#### Get Google Token (by Client ID)
```http
POST /api/oauth/google-token
Content-Type: application/json

{
  "clientId": "clinic-xyz"
}
```

Response:
```json
{
  "access_token": "ya29.a0AfH6SMB...",
  "expires_at": 1699564800000,
  "scopes": "https://www.googleapis.com/auth/calendar ...",
  "provider": "google"
}
```

See [n8n Integration Guide](./N8N_INTEGRATION_GUIDE.md) for complete workflow examples.

### Client Management

- `GET /api/clients` - List all clients
- `GET /api/clients/:id` - Get client details
- `POST /api/clients` - Create new client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Form Submissions

- `GET /api/submissions` - List all submissions
- `POST /api/submissions` - Create submission
- `GET /api/stats` - Get statistics

### Draft Management

- `GET /api/drafts/:clientId` - Get saved draft
- `POST /api/drafts` - Save draft
- `DELETE /api/drafts/:clientId` - Delete draft

## 🗄️ Database Schema

Key tables:
- `clients` - Clinic configurations and Clerk user linkage
- `form_submissions` - Completed onboarding forms
- `drafts` - In-progress form data

See [README_DATABASE.md](./README_DATABASE.md) for full schema details.

## 🧪 Testing

### Test the Portal

1. Create a test client in Admin Panel
2. Visit: `http://localhost:5173?client=test-clinic`
3. Complete the form through all 5 steps
4. Connect Google account in Step 4

### Test n8n Integration

```bash
curl -X POST http://localhost:3001/api/oauth/google-token \
  -H "Content-Type: application/json" \
  -d '{"clientId": "test-clinic"}'
```

Should return a valid Google access token!

## 🚀 Deployment

### Environment Variables for Production

```bash
# Database
DATABASE_URL=postgresql://user:pass@production-host:5432/dbname?sslmode=require

# Clerk (use production keys)
VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_key
CLERK_SECRET_KEY=sk_live_your_key

# OpenAI
OPENAI_API_KEY=your_production_key

# Server
PORT=3001
NODE_ENV=production
```

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

## 📦 Tech Stack

- **Frontend**: React 19, Vite, TailwindCSS
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL
- **Authentication**: Clerk
- **Forms**: TanStack Form
- **Routing**: React Router

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

[Your License Here]

## 🆘 Support

- Check the [Clerk OAuth Setup Guide](./CLERK_OAUTH_SETUP.md) for auth issues
- Check the [n8n Integration Guide](./N8N_INTEGRATION_GUIDE.md) for workflow issues
- Review [Clerk's documentation](https://clerk.com/docs)
- Check the troubleshooting section in each guide

## 🎉 Credits

Built with ❤️ for clinic automation and efficiency.
