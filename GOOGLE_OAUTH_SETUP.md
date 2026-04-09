# Google OAuth Setup for CreateAndColor

This guide will help you set up Google Sign-In for your app.

## Step 1: Go to Google Cloud Console

Visit: https://console.cloud.google.com/

## Step 2: Create or Select Project

1. **If you don't have a project:**
   - Click "Select a project" at the top
   - Click "NEW PROJECT"
   - Name: `CreateAndColor` (or any name)
   - Click "CREATE"

2. **If you already have a project:**
   - Select it from the dropdown

## Step 3: Enable Google+ API (if needed)

1. Go to: https://console.cloud.google.com/apis/library
2. Search for "Google+ API"
3. Click on it and click "ENABLE" (if not already enabled)

## Step 4: Configure OAuth Consent Screen

1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Choose "External" (unless you have a Google Workspace)
3. Click "CREATE"

### Fill in the required fields:

**App Information:**
- **App name**: `CreateAndColor`
- **User support email**: Your email address
- **App logo**: (Optional) Upload your app logo

**App domain:**
- **Application home page**: `https://createandcolor.aivantageworks.com`
- **Application privacy policy**: `https://createandcolor.aivantageworks.com/privacy`
- **Application terms of service**: (Optional)

**Authorized domains:**
Add these domains:
- `aivantageworks.com`
- `vercel.app`

**Developer contact information:**
- Your email address

4. Click "SAVE AND CONTINUE"
5. On "Scopes" page, click "SAVE AND CONTINUE" (default scopes are fine)
6. On "Test users" page, click "SAVE AND CONTINUE"
7. Review and click "BACK TO DASHBOARD"

## Step 5: Create OAuth 2.0 Credentials

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click "+ CREATE CREDENTIALS" at the top
3. Select "OAuth client ID"

### Configure OAuth Client:

**Application type:** Web application

**Name:** `CreateAndColor Web Client` (or any name)

**Authorized JavaScript origins:**
Add these URIs:
```
http://localhost:3000
https://createcolor.vercel.app
https://createandcolor.aivantageworks.com
```

**Authorized redirect URIs:**
Add these URIs (IMPORTANT):
```
http://localhost:3000/api/auth/callback/google
https://createcolor.vercel.app/api/auth/callback/google
https://createandcolor.aivantageworks.com/api/auth/callback/google
```

4. Click "CREATE"

## Step 6: Save Your Credentials

You'll see a popup with:
- **Client ID**: `xxxxxxxxxxxx.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-xxxxxxxxxxxxx`

### Add to Local Environment (.env):

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret
```

### Add to Vercel Environment Variables:

1. Go to: https://vercel.com/dashboard
2. Select your `createcolor` project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:
   - `GOOGLE_CLIENT_ID` = your client ID
   - `GOOGLE_CLIENT_SECRET` = your client secret
5. Set environment to: **Production, Preview, Development**
6. Click "Save"

## Step 7: Redeploy (if needed)

After adding environment variables to Vercel:

```bash
npx vercel --prod
```

Or Vercel will automatically redeploy on your next git push.

## Testing Google Sign-In

### Test Locally:
1. Start dev server: `npm run dev`
2. Go to: http://localhost:3000/login
3. Click "Sign in with Google"
4. Should redirect to Google login

### Test Production:
1. Go to: https://createcolor.vercel.app/login
2. Or: https://createandcolor.aivantageworks.com/login (after DNS setup)
3. Click "Sign in with Google"
4. Should work!

## Troubleshooting

### Error: "redirect_uri_mismatch"
**Solution:**
- Check that the redirect URI in Google Cloud Console EXACTLY matches:
  - `https://createandcolor.aivantageworks.com/api/auth/callback/google`
- No trailing slashes
- Correct protocol (https:// not http://)

### Error: "This app isn't verified"
**Normal for development!** This appears because:
- Your app is in "Testing" mode
- You haven't submitted for verification

**To fix:**
1. Add your email as a test user in OAuth consent screen
2. Click "Continue" when you see the warning
3. OR submit app for verification (for production)

### Error: "Access blocked: Authorization Error"
**Solution:**
- Go to OAuth consent screen
- Make sure app is not in "Testing" mode, or
- Add your test users in the "Test users" section

## Publishing Your App (Production)

When ready for public users:

1. Go to OAuth consent screen
2. Click "PUBLISH APP"
3. Submit for verification if needed (for large user base)

## Important Notes

- Keep `GOOGLE_CLIENT_SECRET` secure - never commit to git
- For production, consider submitting app for Google verification
- Test users can use the app even in "Testing" mode
- Production domains must be added to authorized domains

## Quick Reference

**Google Cloud Console**: https://console.cloud.google.com/
**Credentials Page**: https://console.cloud.google.com/apis/credentials
**OAuth Consent Screen**: https://console.cloud.google.com/apis/credentials/consent

---

**Your Domains:**
- Local: http://localhost:3000
- Vercel: https://createcolor.vercel.app
- Custom: https://createandcolor.aivantageworks.com
