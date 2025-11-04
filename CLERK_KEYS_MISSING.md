# ⚠️ Missing Clerk Keys - Quick Fix

You're seeing this error because Clerk authentication keys are not configured yet:

```
Error: Publishable key is missing
```

## Quick Fix (5 minutes)

### Option 1: Get Real Clerk Keys (Recommended)

1. **Go to** https://dashboard.clerk.com/
2. **Sign up** for free account
3. **Create a new application**
4. **Copy your keys** from the dashboard
5. **Add to your `.env` file:**

```bash
# Add BOTH versions (with and without VITE_ prefix)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
CLERK_SECRET_KEY=sk_test_your_actual_secret_here
```

6. **Restart your server:** `npm run dev`

### Option 2: Disable Clerk Temporarily (Testing Only)

If you just want to test without Clerk:

1. **Comment out Clerk in `server.js`:**
   
   Find this section (around line 30):
   ```javascript
   // Only use Clerk middleware if keys are present
   if (clerkPublishableKey && clerkSecretKey) {
     app.use(clerkMiddleware({
       publishableKey: clerkPublishableKey,
       secretKey: clerkSecretKey,
     }))
   }
   ```
   
   The server will automatically skip Clerk if keys are missing!

2. **For the frontend**, wrap Clerk components conditionally or just sign up for Clerk (it's free and takes 2 minutes!)

## Why Both VITE_ and non-VITE_ Keys?

- `VITE_CLERK_PUBLISHABLE_KEY` → Used by your **React frontend** (Vite exposes VITE_* vars to browser)
- `CLERK_PUBLISHABLE_KEY` → Used by your **Express backend** (not exposed to browser)
- `CLERK_SECRET_KEY` → Used by your **Express backend** only (NEVER in frontend!)

## Current Workaround Active

The server is currently configured to **gracefully skip Clerk** if keys are missing, so:
- ✅ Your form will work
- ✅ Database operations work
- ❌ Google OAuth won't work (needs Clerk)
- ❌ Admin panel authentication won't work

## Next Steps

Follow [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md) Step 3-4 to get your Clerk keys properly configured.

It takes about 5 minutes total! 🚀
