# 🔧 FIX: OAuth Returns to Home Page

## The Problem

After signing in with Google, Clerk redirects to `/` instead of back to the form with `?client=clinic-name`.

## The Fix

### In Clerk Dashboard:

1. Go to: https://dashboard.clerk.com/
2. Navigate to: **"Configure" → "Paths"**
3. Look for these settings:

#### Sign-up URL
Set to: `/`

#### After sign-up URL
Set to: **"Custom"** and leave the field empty (or set to `/`)

This allows the app to handle redirects programmatically.

#### Alternative: Use Environment Variables

If the above doesn't work, set these in Clerk:

**"After sign-in URL"**: `/`  
**"After sign-up URL"**: `/`

Then let the app handle the redirect with the stored URL.

---

## Code Fix Applied

I've updated:
1. ✅ `App.tsx` - Custom navigation handler
2. ✅ `IntegrationsStep.jsx` - Redirect URLs set to `window.location.href`

---

## Test It

1. Go to: `http://localhost:5173/?client=test-clinic`
2. Navigate to Step 4
3. Click "Entrar com Google"
4. Sign in
5. **You should return to the same URL with `?client=test-clinic`**

If it still goes to home:
- Clear browser cache
- Try incognito window
- Check Clerk dashboard "Paths" configuration

---

## If Still Not Working

The nuclear option - store the client ID in sessionStorage:

I can add this fallback if the redirect URLs don't work.
