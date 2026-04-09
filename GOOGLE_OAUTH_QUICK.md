# Google OAuth Quick Setup Checklist

## 🚀 Quick Steps (10 minutes)

### 1. Go to Google Cloud Console
👉 https://console.cloud.google.com/apis/credentials

### 2. Add Redirect URIs
Click on your OAuth 2.0 Client ID → Edit

Add these **Authorized redirect URIs**:
```
http://localhost:3000/api/auth/callback/google
https://createcolor.vercel.app/api/auth/callback/google
https://createandcolor.aivantageworks.com/api/auth/callback/google
```

Click **SAVE**

### 3. Add to Vercel Environment Variables
👉 https://vercel.com/dashboard → Your Project → Settings → Environment Variables

Add if not already there:
- `GOOGLE_CLIENT_ID` = (your client ID)
- `GOOGLE_CLIENT_SECRET` = (your client secret)

### 4. Test It!
Visit: https://createcolor.vercel.app/login

Click "Sign in with Google" ✓

---

## ⚠️ Common Issues

**Error: "redirect_uri_mismatch"**
→ Make sure redirect URI exactly matches (no trailing slash):
   `https://createandcolor.aivantageworks.com/api/auth/callback/google`

**Error: "This app isn't verified"**
→ Normal! Click "Advanced" → "Go to CreateAndColor (unsafe)" during testing

**Not working?**
→ Check environment variables are set in Vercel
→ Redeploy: `npx vercel --prod`

---

## 📋 Your Current Setup

**Local Development:**
- URL: http://localhost:3000
- Redirect: http://localhost:3000/api/auth/callback/google

**Vercel Production:**
- URL: https://createcolor.vercel.app
- Redirect: https://createcolor.vercel.app/api/auth/callback/google

**Custom Domain (after DNS setup):**
- URL: https://createandcolor.aivantageworks.com
- Redirect: https://createandcolor.aivantageworks.com/api/auth/callback/google

---

Need detailed instructions? See [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)
