# Sign-in Redirect Fix

## Problem
Users were experiencing login redirect loops - after signing in with Google OAuth or other providers, they were redirected back to the login page instead of the dashboard.

## Root Cause Analysis

### Primary Issue: NEXTAUTH_URL Mismatch
The main issue was a mismatch between the `NEXTAUTH_URL` environment variable and the actual server port:
- `NEXTAUTH_URL` was set to `http://localhost:3001` in `.env.local`  
- Development server was running on different ports (3000, 3006, 3007, etc.)
- This caused OAuth callback URLs to point to the wrong port, breaking the authentication flow

### Previous Fixes Applied
1. **Updated signin page redirects** (`src/app/signin/page.tsx`):
   - Changed manual redirect from `/subscription` to `/dashboard` (line 45)
   - Updated social login callbackUrl from `/subscription` to `/dashboard` (line 62)

2. **Fixed NextAuth default redirect** (`src/lib/auth.ts`):
   - Changed default redirect callback from `/subscription` to `/dashboard` (lines 106-109)

## Solution

### For Development
Ensure `NEXTAUTH_URL` in your `.env.local` matches the actual development server port:

```bash
# If server runs on port 3000
NEXTAUTH_URL="http://localhost:3000"

# If server runs on port 3001  
NEXTAUTH_URL="http://localhost:3001"

# etc...
```

### For Production
The production deployment should have:
```bash
NEXTAUTH_URL="https://your-production-domain.com"
```

## Verification Steps

1. **Check server port**: Note which port your dev server starts on
2. **Update NEXTAUTH_URL**: Make sure it matches the server port
3. **Restart server**: Changes to environment variables require server restart
4. **Test OAuth flow**: 
   - Visit `/signin`
   - Click Google/GitHub OAuth button
   - Should redirect to OAuth provider (not stay on signin page)
   - After OAuth completion, should redirect to `/dashboard`

## Files Modified
- `src/app/signin/page.tsx` - Fixed manual redirects to dashboard
- `src/lib/auth.ts` - Fixed NextAuth default redirect callback
- `.env.local` - Updated NEXTAUTH_URL to match server port (not tracked in git)

## Prevention
Consider using a fixed port in development by updating `package.json`:
```json
{
  "scripts": {
    "dev": "next dev --turbopack --port 3000"
  }
}
```

This ensures the development server always uses port 3000, making the environment variable consistent.