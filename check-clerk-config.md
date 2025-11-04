# Clerk Configuration Issue

The OAuth redirect is taking you to `/` instead of back to the form.

## The Problem

Clerk needs to be configured to allow your redirect URLs.

## Fix in Clerk Dashboard

1. Go to: https://dashboard.clerk.com/
2. Go to your app
3. Navigate to: **"Configure" → "Paths"**
4. Under **"Sign-up URL"** add: `http://localhost:5173`
5. Under **"After sign-up URL"** add: `http://localhost:5173`
6. Or set it to: `Custom redirect URL` 

## Better Solution: Use Clerk Components

Instead of using `authenticateWithRedirect`, let me add a proper sign-up component.

