# Complete Authentication Setup Guide

This checklist will get your authentication working for both email/password and Google OAuth.

## 🔍 Current Status

Your app already has authentication code built-in! You just need to configure the credentials.

### What's Already Built:
- ✅ NextAuth.js configured
- ✅ Email/Password signup and login
- ✅ Google OAuth integration
- ✅ MongoDB user storage
- ✅ Session management

### What You Need to Setup:
- ⬜ MongoDB connection
- ⬜ NextAuth secret
- ⬜ Google OAuth credentials
- ⬜ Environment variables in Vercel

---

## 📋 Setup Checklist

### 1️⃣ MongoDB Setup

**If you don't have MongoDB Atlas:**

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up for free account
3. Create a free cluster (M0)
4. Click "Connect" → "Connect your application"
5. Copy the connection string

**Add to `.env` file:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/createcolor?retryWrites=true&w=majority
```

Replace `username` and `password` with your MongoDB credentials.

**In MongoDB Atlas, whitelist all IPs:**
- Go to: Network Access
- Click "ADD IP ADDRESS"
- Select "ALLOW ACCESS FROM ANYWHERE" (0.0.0.0/0)
- Click "Confirm"

---

### 2️⃣ NextAuth Secret

Generate a secure secret:

**On Mac/Linux:**
```bash
openssl rand -base64 32
```

**On Windows (PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Add to `.env` file:**
```env
NEXTAUTH_SECRET=paste-your-generated-secret-here
NEXTAUTH_URL=http://localhost:3000
```

---

### 3️⃣ Google OAuth Credentials

**Follow these guides in order:**

1. **Creating from scratch?**
   → See: [GOOGLE_OAUTH_FROM_SCRATCH.md](./GOOGLE_OAUTH_FROM_SCRATCH.md)

2. **Already have credentials?**
   → See: [GOOGLE_OAUTH_QUICK.md](./GOOGLE_OAUTH_QUICK.md)

**You need:**
- Google Client ID
- Google Client Secret

**Add to `.env` file:**
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret
```

---

### 4️⃣ Complete `.env` File

Your complete `.env` file should have:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/createcolor?retryWrites=true&w=majority

# NextAuth
NEXTAUTH_SECRET=your-generated-secret
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret

# AI APIs (optional for now, needed for features)
OPENAI_API_KEY=sk-your-openai-key
GEMINI_API_KEY=your-gemini-key
REPLICATE_API_TOKEN=your-replicate-token
TOGETHER_API_KEY=your-together-key

# AWS S3 (optional, for image storage)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_BUCKET_NAME=createcolor-images
AWS_REGION=us-east-1

# Public URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### 5️⃣ Add to Vercel Environment Variables

1. Go to: https://vercel.com/dashboard
2. Select your **createcolor** project
3. Go to: **Settings** → **Environment Variables**
4. Add each variable:
   - Click "Add New"
   - Key: Variable name (e.g., `MONGODB_URI`)
   - Value: Variable value
   - Environment: Check all (Production, Preview, Development)
   - Click "Save"

**Required for Production:**
```env
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=https://createandcolor.aivantageworks.com
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
NEXT_PUBLIC_APP_URL=https://createandcolor.aivantageworks.com
```

**Important:**
- Use `https://createandcolor.aivantageworks.com` for production URLs
- Use `https://createcolor.vercel.app` if custom domain not ready yet

---

### 6️⃣ Test Authentication Locally

```bash
# Start dev server
npm run dev
```

**Test Email/Password:**
1. Go to: http://localhost:3000/signup
2. Create account with email/password
3. Should redirect to login
4. Login with same credentials
5. Should redirect to /create page

**Test Google OAuth:**
1. Go to: http://localhost:3000/login
2. Click "Sign in with Google"
3. Login with Google account
4. Should redirect to /create page

---

### 7️⃣ Test Production

After adding env variables to Vercel:

1. Visit: https://createcolor.vercel.app/login
2. Test both login methods
3. Should work! 🎉

---

## ✅ Verification Checklist

### Local Development:
- [ ] MongoDB connection works
- [ ] Can create account with email/password
- [ ] Can login with email/password
- [ ] Can login with Google
- [ ] After login, redirects to /create
- [ ] User session persists (refresh page, still logged in)

### Production (Vercel):
- [ ] All environment variables added to Vercel
- [ ] MongoDB allows Vercel IP connections (0.0.0.0/0)
- [ ] Google OAuth redirect URIs include production URL
- [ ] Can create account on production
- [ ] Can login on production
- [ ] Google OAuth works on production

---

## 🐛 Troubleshooting

### "Cannot connect to database"
**Solution:**
- Check MongoDB URI is correct
- Verify MongoDB Atlas allows all IPs (0.0.0.0/0)
- Test connection string in MongoDB Compass

### "No user found with this email"
**Solution:**
- User might be in database without password (Google OAuth user)
- Create new account instead
- Check MongoDB to see if user exists

### "Invalid redirect URI" (Google OAuth)
**Solution:**
- Go to: https://console.cloud.google.com/apis/credentials
- Click your OAuth client
- Add these exact URIs:
  ```
  http://localhost:3000/api/auth/callback/google
  https://createcolor.vercel.app/api/auth/callback/google
  https://createandcolor.aivantageworks.com/api/auth/callback/google
  ```

### "Configuration error" in NextAuth
**Solution:**
- Check all required env variables are set
- Restart dev server: `Ctrl+C` then `npm run dev`
- Clear browser cache and cookies

### Production not working but local works
**Solution:**
- Verify ALL env variables added to Vercel
- Check Vercel deployment logs
- Redeploy: `npx vercel --prod`

### Google login shows "This app isn't verified"
**Solution:**
- Normal during development!
- Click "Advanced" → "Go to CreateAndColor (unsafe)"
- Add yourself as test user in Google Cloud Console

---

## 🔐 Security Notes

### Keep These Secret (Never Commit to Git):
- ❌ MONGODB_URI
- ❌ NEXTAUTH_SECRET
- ❌ GOOGLE_CLIENT_SECRET
- ❌ API keys

### Safe to Share:
- ✅ GOOGLE_CLIENT_ID (public)
- ✅ NEXT_PUBLIC_APP_URL (public)

### Your `.env` file should be in `.gitignore` (already done ✓)

---

## 📊 Testing Users

After setup, you'll have these login methods:

### Method 1: Email/Password
- User creates account at `/signup`
- Password hashed with bcrypt
- Stored in MongoDB

### Method 2: Google OAuth
- User clicks "Sign in with Google"
- OAuth flow via Google
- User profile stored in MongoDB
- No password needed

### Both methods:
- Create session with NextAuth
- Session stored as JWT
- 30-day session by default
- User data in MongoDB

---

## 🚀 Quick Setup Commands

```bash
# 1. Generate NextAuth secret
openssl rand -base64 32

# 2. Test local setup
npm run dev

# 3. Deploy to Vercel
npx vercel --prod

# 4. Check logs
npx vercel logs
```

---

## 📞 Need Help?

**Check these in order:**
1. [GOOGLE_OAUTH_FROM_SCRATCH.md](./GOOGLE_OAUTH_FROM_SCRATCH.md) - Google OAuth setup
2. MongoDB Atlas documentation: https://docs.atlas.mongodb.com/
3. NextAuth.js docs: https://next-auth.js.org/
4. Vercel docs: https://vercel.com/docs

---

## ✨ What's Next After Auth Works?

Once authentication is working:
- ✅ Users can create coloring pages (5/day limit)
- ✅ Users can create storybooks (2/day limit)
- ✅ Users can save to gallery
- ✅ Magic Lens feature
- ✅ Parent dashboard

All features are already built - they just need authentication to work!

---

**Last Updated:** April 2026
**App:** CreateAndColor
**Domain:** createandcolor.aivantageworks.com
