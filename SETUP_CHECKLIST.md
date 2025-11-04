# 🚀 Quick Setup Checklist

Use this checklist to get Clerk OAuth up and running quickly.

---

## ☐ Step 1: Create Clerk Account

1. Go to https://clerk.com/
2. Sign up for a free account
3. Create a new application:
   - Name: `Formulário Secretária`
   - Select authentication methods: **Email** + **Google**
4. ✅ Application created!

---

## ☐ Step 2: Configure Google OAuth in Clerk

1. In Clerk Dashboard, go to: **User & Authentication** → **Social Connections**
2. Click on **Google**
3. Toggle **"Enable Google"** to ON
4. Choose your option:

   ### Option A: Quick Start (Development)
   - Toggle **"Use Clerk's shared OAuth credentials"**
   - ✅ Done! (Takes 30 seconds)
   
   ### Option B: Production Setup (Recommended)
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable APIs:
     - Google Calendar API
     - Google Drive API
     - Gmail API
     - Google Tasks API
   - Create OAuth 2.0 Credentials
   - Add these authorized redirect URIs (get from Clerk dashboard):
     ```
     https://your-clerk-instance.clerk.accounts.dev/v1/oauth_callback
     ```
   - Copy **Client ID** and **Client Secret**
   - Paste into Clerk dashboard
   - ✅ Done!

5. **Add Required Scopes** (Important!)
   - In Clerk, under Google settings, add these scopes:
   ```
   https://www.googleapis.com/auth/calendar
   https://www.googleapis.com/auth/drive
   https://www.googleapis.com/auth/tasks
   https://www.googleapis.com/auth/gmail.modify
   ```
   - Click **Save**

---

## ☐ Step 3: Get Your Clerk API Keys

1. In Clerk Dashboard, go to: **Developers** → **API Keys**
2. Copy these two keys:
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)
3. ⚠️ Keep Secret Key secure! Never commit to git.

---

## ☐ Step 4: Configure Environment Variables

1. Open your `.env` file (create if it doesn't exist)
2. Add these lines:

```bash
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_paste_your_key_here
CLERK_SECRET_KEY=sk_test_paste_your_key_here
```

3. Make sure `.env` is in your `.gitignore`
4. ✅ Keys configured!

---

## ☐ Step 5: Install Dependencies

```bash
npm install
```

Expected packages installed:
- `@clerk/clerk-react`
- `@clerk/backend`
- `@clerk/express`

✅ Dependencies installed!

---

## ☐ Step 6: Run Database Migration

```bash
# Option 1: Create and run migration script
cat > run-clerk-migration.js << 'EOF'
import { getPool } from './src/lib/db.js';
import fs from 'fs';

async function runMigration() {
  const pool = getPool();
  try {
    console.log('Running Clerk migration...');
    const migration = fs.readFileSync('./database/migration_add_clerk_user_id.sql', 'utf8');
    await pool.query(migration);
    console.log('✅ Migration completed!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await pool.end();
  }
}
runMigration();
EOF

node run-clerk-migration.js
rm run-clerk-migration.js
```

Verify migration worked:
```bash
# Check if clerk_user_id column exists
node -e "
import { query } from './src/lib/db.js';
const result = await query(\`
  SELECT column_name FROM information_schema.columns 
  WHERE table_name = 'clients' AND column_name = 'clerk_user_id'
\`);
console.log(result.rows.length > 0 ? '✅ Migration successful!' : '❌ Migration failed');
process.exit();
"
```

---

## ☐ Step 7: Start Development Servers

```bash
npm run dev
```

This starts:
- ✅ Frontend on http://localhost:5173
- ✅ Backend API on http://localhost:3001

---

## ☐ Step 8: Test OAuth Flow

### A. Create a Test Client

1. Open http://localhost:5173/admin
2. Click **"Novo Cliente"**
3. Fill in:
   - Client ID: `test-clinic`
   - Name: `Test Clinic`
4. Click **"Criar Cliente"**
5. ✅ Client created!

### B. Test the Portal

1. Open: http://localhost:5173?client=test-clinic
2. You should see the welcome screen
3. Navigate through the form steps
4. On **Step 4 (Integrações)**:
   - You should see: "Conectar Conta Google" button
   - Click it
   - ✅ Clerk OAuth popup should appear!

### C. Complete OAuth

1. Sign in with your Google account
2. Grant permissions (Calendar, Drive, Tasks, Gmail)
3. You should be redirected back to the form
4. The connection status should show green checkmarks
5. ✅ OAuth connected!

---

## ☐ Step 9: Test Token Endpoint

### Test with curl:

```bash
curl -X POST http://localhost:3001/api/oauth/google-token \
  -H "Content-Type: application/json" \
  -d '{"clientId": "test-clinic"}'
```

### Expected Response:

```json
{
  "access_token": "ya29.a0AfH6SMB...",
  "expires_at": 1699564800000,
  "scopes": "https://www.googleapis.com/auth/calendar ...",
  "provider": "google",
  "clientId": "test-clinic"
}
```

### If you get an error:

**Error: "Client not found or not linked to a user"**
- Solution: Complete and submit the form first
- The client gets linked to the Clerk user on form submission

**Error: "Google account not connected"**
- Solution: Go back to Step 8C and complete the OAuth flow

**Error: "Missing Clerk Publishable Key"**
- Solution: Check your `.env` file and restart the server

✅ Token endpoint working!

---

## ☐ Step 10: Test in n8n (Optional)

### A. Create Simple Test Workflow

1. Open n8n
2. Create new workflow
3. Add nodes:

**Node 1: Manual Trigger**

**Node 2: HTTP Request**
```
Method: POST
URL: http://localhost:3001/api/oauth/google-token
Body (JSON):
{
  "clientId": "test-clinic"
}
```

**Node 3: HTTP Request**
```
Method: GET
URL: https://www.googleapis.com/calendar/v3/calendars/primary/events
Authentication: Header Auth
  Header Name: Authorization
  Header Value: Bearer {{ $node["HTTP Request"].json.access_token }}
Query Parameters:
  maxResults: 5
```

### B. Execute Workflow

1. Click **"Execute Workflow"**
2. Check each node's output
3. Node 3 should return calendar events!
4. ✅ n8n integration working!

---

## 🎉 Setup Complete!

You've successfully set up Clerk OAuth! Here's what you can do now:

### ✅ What's Working:
- Clerk authentication in your app
- Google OAuth flow via Clerk
- Automatic token refresh
- Token API endpoint for n8n
- Secure token storage

### 📚 Next Steps:
1. Read the [n8n Integration Guide](./N8N_INTEGRATION_GUIDE.md) for workflow examples
2. Read the [Clerk Setup Guide](./CLERK_OAUTH_SETUP.md) for advanced configuration
3. Start building your n8n automations!

### 🆘 Troubleshooting:

**Issue: Clerk popup doesn't appear**
- Check browser console for errors
- Verify `VITE_CLERK_PUBLISHABLE_KEY` is set correctly
- Make sure you restarted the dev server after adding env vars

**Issue: OAuth completes but connection doesn't show**
- Check if the required scopes are configured in Clerk
- Try disconnecting and reconnecting the Google account

**Issue: Token endpoint returns 404**
- Make sure you've submitted the form at least once
- Check that the client exists in the database
- Verify the `clerk_user_id` is set for the client

**Still having issues?**
- Check the [Migration Summary](./MIGRATION_SUMMARY.md)
- Review Clerk's [troubleshooting docs](https://clerk.com/docs/troubleshooting)
- Join Clerk's [Discord community](https://clerk.com/discord)

---

## 📋 Configuration Summary

After completing this checklist, you should have:

- ✅ Clerk account created
- ✅ Google OAuth configured in Clerk
- ✅ API keys added to `.env`
- ✅ Dependencies installed
- ✅ Database migrated
- ✅ Dev servers running
- ✅ OAuth flow tested
- ✅ Token endpoint working
- ✅ n8n integration verified

**Total setup time:** ~30-60 minutes

**Maintenance required:** Minimal (Clerk handles everything)

**Monthly cost:** $0 (free tier covers most use cases)

---

## 🚀 You're Ready!

Start building your automations with confidence. No more manual token refresh logic!

Happy automating! 🎉
