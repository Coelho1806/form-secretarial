# 🔧 Setup Google OAuth with Custom Credentials (Full API Access)

## Why You Need This

Clerk's shared credentials only give `email` and `profile` access.

For Google Calendar, Drive, Tasks, and Gmail APIs, you MUST create your own Google OAuth credentials.

---

## Step 1: Create Google Cloud Project

1. Go to: https://console.cloud.google.com/
2. Click **"Select a project"** → **"New Project"**
3. Project name: `Secretaria Assistant` (or whatever you want)
4. Click **"Create"**
5. Wait for the project to be created (takes a few seconds)

---

## Step 2: Enable Required APIs

In your new project:

1. Go to: **"APIs & Services"** → **"Library"**
2. Search and enable each of these:
   - ✅ **Google Calendar API** (search → click → Enable)
   - ✅ **Google Drive API** (search → click → Enable)
   - ✅ **Gmail API** (search → click → Enable)
   - ✅ **Google Tasks API** (search → click → Enable)

---

## Step 3: Configure OAuth Consent Screen

1. Go to: **"APIs & Services"** → **"OAuth consent screen"**
2. Select: **"External"** (unless you have Google Workspace)
3. Click **"Create"**

**Fill in the form:**

### App Information
- **App name:** `Secretaria Assistant`
- **User support email:** Your email
- **App logo:** (optional, skip for now)

### App Domain (optional for testing)
- Leave blank for now

### Developer contact information
- **Email:** Your email

4. Click **"Save and Continue"**

### Scopes Screen
1. Click **"Add or Remove Scopes"**
2. Add these scopes:
   ```
   https://www.googleapis.com/auth/userinfo.email
   https://www.googleapis.com/auth/userinfo.profile
   https://www.googleapis.com/auth/calendar
   https://www.googleapis.com/auth/drive
   https://www.googleapis.com/auth/tasks
   https://www.googleapis.com/auth/gmail.modify
   ```
3. Click **"Update"**
4. Click **"Save and Continue"**

### Test Users (Important!)
1. Click **"Add Users"**
2. Add your email: `lucas.coelho.cardoso@gmail.com`
3. Add any other test emails you'll use
4. Click **"Add"**
5. Click **"Save and Continue"**

6. Review and click **"Back to Dashboard"**

---

## Step 4: Create OAuth 2.0 Credentials

1. Go to: **"APIs & Services"** → **"Credentials"**
2. Click **"+ Create Credentials"** → **"OAuth client ID"**
3. Application type: **"Web application"**
4. Name: `Secretaria Clerk OAuth`

### Authorized JavaScript origins
Add:
```
http://localhost:5173
```

### Authorized redirect URIs
**This is CRITICAL!** You need to get your exact Clerk callback URL.

**To find it:**
1. Open another tab: https://dashboard.clerk.com/
2. Go to: **Configure → SSO Connections → Google**
3. Look for **"Authorized redirect URI"** - copy it exactly
4. It looks like: `https://aware-cod-94.clerk.accounts.dev/v1/oauth_callback`

Paste that URL in the **Authorized redirect URIs** field.

5. Click **"Create"**

---

## Step 5: Copy Your Credentials

You'll see a modal with:
- **Client ID:** `123456789-abc...googleusercontent.com`
- **Client Secret:** `GOCSPX-abc123...`

**Keep this window open!** Or download the JSON file.

---

## Step 6: Add Credentials to Clerk

1. Go back to: https://dashboard.clerk.com/
2. Go to: **Configure → SSO Connections → Google**
3. Select: **"Use custom credentials"**
4. Paste:
   - **Client ID:** (from Google)
   - **Client Secret:** (from Google)
5. Click **"Save"**

---

## Step 7: Test It!

1. Go to: `http://localhost:5173/?client=test-clinic`
2. Navigate to Step 4 (Integrations)
3. Click **"Entrar com Google e Autorizar Serviços"**
4. Sign in with a test user email (the one you added in Step 3)
5. You should see a consent screen asking for:
   - ✅ Calendar access
   - ✅ Drive access
   - ✅ Tasks access
   - ✅ Gmail access
6. Click **"Allow"**

---

## Troubleshooting

### Error: "Access blocked: This app is not verified"

**Normal for testing!** Google shows this for apps not published.

**To bypass:**
1. Click **"Advanced"** (small link)
2. Click **"Go to Secretaria Assistant (unsafe)"**
3. Continue with authorization

**For production:** Submit app for verification (takes time)

### Error: "redirect_uri_mismatch"

Your Clerk redirect URI doesn't match what's in Google Console.

**Fix:**
1. Copy the exact URI from Clerk dashboard
2. Add it to Google Console → Credentials → Your OAuth client → Authorized redirect URIs
3. Save and try again

### Error: "Access denied" / Can't use this email

You forgot to add the email as a test user!

**Fix:**
1. Google Console → OAuth consent screen → Test users
2. Add the email
3. Try again

---

## ✅ Success!

After completing these steps, your OAuth will work with FULL access to Calendar, Drive, Tasks, and Gmail!

Each clinic that fills the form will authorize THEIR Google account with these permissions.

🎉 You're ready for multi-tenant OAuth!
