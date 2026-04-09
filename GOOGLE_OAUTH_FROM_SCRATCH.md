# Google OAuth Setup From Scratch

Follow these steps exactly - I'll guide you through creating everything from scratch.

## Step 1: Create New Project (You Are Here!)

1. You're at: https://console.cloud.google.com/
2. You see "Select a project" or "Create a project"
3. **Click**: "NEW PROJECT" (top right or center button)

### Fill in Project Details:
- **Project name**: `CreateAndColor` (or `createandcolor-app`)
- **Organization**: Leave as "No organization" (unless you have one)
- **Location**: Leave as default
- **Click**: "CREATE" button

⏱️ Wait 10-30 seconds for project creation...

### After Project is Created:
- You'll see a notification saying "Project created"
- The project will be automatically selected
- You should see "CreateAndColor" in the top bar

---

## Step 2: Configure OAuth Consent Screen

This tells Google what your app is about.

1. **Go to**: https://console.cloud.google.com/apis/credentials/consent
   - Or: Left menu → APIs & Services → OAuth consent screen

2. **Choose User Type**:
   - Select: ⚪ **External** (choose this!)
   - Click: "CREATE"

### App Information Page:

**App name**: `CreateAndColor`

**User support email**: (your email will be pre-filled - leave it)

**App logo**: Skip for now (optional)

**Application home page**:
```
https://createandcolor.aivantageworks.com
```

**Application privacy policy link**:
```
https://createandcolor.aivantageworks.com/privacy
```

**Application terms of service**: (leave blank - optional)

**Authorized domains**: Click "+ ADD DOMAIN" twice and add:
```
aivantageworks.com
vercel.app
```

**Developer contact information**: (your email - should be pre-filled)

3. **Click**: "SAVE AND CONTINUE" (bottom)

### Scopes Page:
- Don't add any scopes (default is fine)
- **Click**: "SAVE AND CONTINUE"

### Test Users Page:
- Click "+ ADD USERS"
- Add your email (the one you'll use to test)
- **Click**: "ADD"
- **Click**: "SAVE AND CONTINUE"

### Summary Page:
- Review everything
- **Click**: "BACK TO DASHBOARD"

✅ OAuth Consent Screen is configured!

---

## Step 3: Create OAuth Credentials

Now let's get your Client ID and Secret.

1. **Go to**: https://console.cloud.google.com/apis/credentials
   - Or: Left menu → APIs & Services → Credentials

2. **Click**: "+ CREATE CREDENTIALS" (top of page)

3. **Select**: "OAuth client ID"

### You might see "Configure Consent Screen First"
If you see this error:
- Click "CONFIGURE CONSENT SCREEN"
- Follow Step 2 above
- Come back here

### Create OAuth Client ID:

**Application type**: Select "Web application"

**Name**: `CreateAndColor Web Client`

**Authorized JavaScript origins**: Click "+ ADD URI" three times and add:
```
http://localhost:3000
```
```
https://createcolor.vercel.app
```
```
https://createandcolor.aivantageworks.com
```

**Authorized redirect URIs**: Click "+ ADD URI" three times and add:
```
http://localhost:3000/api/auth/callback/google
```
```
https://createcolor.vercel.app/api/auth/callback/google
```
```
https://createandcolor.aivantageworks.com/api/auth/callback/google
```

4. **Click**: "CREATE"

---

## Step 4: Save Your Credentials

A popup appears with your credentials!

### You'll see:
- **Your Client ID**: Something like `123456789-abc123.apps.googleusercontent.com`
- **Your Client Secret**: Something like `GOCSPX-AbCdEf123456`

### Copy These NOW:

**Option 1: Download JSON**
- Click "DOWNLOAD JSON" button
- Save the file somewhere safe

**Option 2: Copy Manually**
- Click the copy icon next to Client ID
- Paste it somewhere safe
- Click the copy icon next to Client secret
- Paste it somewhere safe

---

## Step 5: Add to Local .env File

Open your `.env` file and update:

```env
GOOGLE_CLIENT_ID=paste-your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=paste-your-client-secret-here
```

Replace the placeholder values with your actual credentials.

---

## Step 6: Add to Vercel

1. **Go to**: https://vercel.com/dashboard
2. **Click** on your `createcolor` project
3. **Go to**: Settings → Environment Variables (left sidebar)
4. **Click**: "Add New" button

### Add First Variable:
- **Key**: `GOOGLE_CLIENT_ID`
- **Value**: (paste your client ID)
- **Environment**: Check all three: Production, Preview, Development
- **Click**: "Save"

### Add Second Variable:
- **Click**: "Add New" again
- **Key**: `GOOGLE_CLIENT_SECRET`
- **Value**: (paste your client secret)
- **Environment**: Check all three: Production, Preview, Development
- **Click**: "Save"

---

## Step 7: Redeploy

After adding environment variables, Vercel needs to redeploy:

**Option 1: Automatic (wait a minute)**
- Vercel will auto-redeploy when you save env variables

**Option 2: Manual**
```bash
npx vercel --prod
```

---

## Step 8: Test It!

### Test Locally:
1. Start your dev server:
```bash
npm run dev
```

2. Visit: http://localhost:3000/login

3. Click "Sign in with Google"

4. You should see Google's login screen

### Test Production:
1. Visit: https://createcolor.vercel.app/login

2. Click "Sign in with Google"

3. Should work! 🎉

---

## Troubleshooting

### "This app isn't verified" Warning
**This is NORMAL during development!**

To continue:
1. Click "Advanced" (bottom left)
2. Click "Go to CreateAndColor (unsafe)"
3. Continue with Google login

This warning appears because:
- Your app is in "Testing" mode
- You haven't submitted for Google verification (not needed yet)

### "Access blocked: Authorization Error"
**Solution**: Add yourself as a test user
1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Scroll to "Test users"
3. Click "ADD USERS"
4. Add your email
5. Try again

### "redirect_uri_mismatch"
**Solution**: Check your redirect URIs
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your OAuth client
3. Verify these EXACT URIs are listed:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://createcolor.vercel.app/api/auth/callback/google`
   - `https://createandcolor.aivantageworks.com/api/auth/callback/google`
4. No trailing slashes!
5. Click "SAVE"

---

## ✅ Success Checklist

- ✅ Google Cloud project created
- ✅ OAuth consent screen configured
- ✅ OAuth client ID created
- ✅ Credentials saved to .env file
- ✅ Credentials added to Vercel
- ✅ App redeployed
- ✅ Google Sign-In tested and working

---

## Quick Reference

**Google Cloud Console**: https://console.cloud.google.com/
**Credentials**: https://console.cloud.google.com/apis/credentials
**OAuth Consent**: https://console.cloud.google.com/apis/credentials/consent
**Vercel Dashboard**: https://vercel.com/dashboard

**Your redirect URIs**:
- `http://localhost:3000/api/auth/callback/google`
- `https://createcolor.vercel.app/api/auth/callback/google`
- `https://createandcolor.aivantageworks.com/api/auth/callback/google`

---

Need help? Let me know which step you're on!
