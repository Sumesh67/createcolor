# Add Environment Variables to Vercel - Step by Step

Follow these exact steps to add your environment variables to Vercel.

## 🔗 Step 1: Open Vercel Dashboard

1. Go to: **https://vercel.com/dashboard**
2. You should see your projects
3. Click on **"createcolor"** project

## ⚙️ Step 2: Go to Settings

1. Click **"Settings"** tab (top navigation)
2. In the left sidebar, click **"Environment Variables"**
3. You should see a page to add variables

## 📝 Step 3: Add Variables One by One

For each variable below, do this:
1. Click **"Add New"** button
2. Enter the **Key** (variable name)
3. Enter the **Value** (copy from your local `.env` file)
4. **Environment**: Check ALL THREE boxes ✓
   - ✓ Production
   - ✓ Preview
   - ✓ Development
5. Click **"Save"**

---

## 🔑 Variables to Add (14 total)

### 1. MONGODB_URI
- **Key**: `MONGODB_URI`
- **Value**: (copy from your `.env` file - starts with `mongodb+srv://`)
- **Environment**: All three ✓
- Click "Save"

### 2. NEXTAUTH_SECRET
- **Key**: `NEXTAUTH_SECRET`
- **Value**: (copy from your `.env` file)
- **Environment**: All three ✓
- Click "Save"

### 3. NEXTAUTH_URL ⚠️ IMPORTANT
- **Key**: `NEXTAUTH_URL`
- **Value**: `https://createandcolor.aivantageworks.com`
  - ⚠️ Use production domain, NOT localhost!
  - Or use `https://createcolor.vercel.app` if domain not ready
- **Environment**: All three ✓
- Click "Save"

### 4. GOOGLE_CLIENT_ID
- **Key**: `GOOGLE_CLIENT_ID`
- **Value**: (copy from your `.env` file - ends with `.apps.googleusercontent.com`)
- **Environment**: All three ✓
- Click "Save"

### 5. GOOGLE_CLIENT_SECRET
- **Key**: `GOOGLE_CLIENT_SECRET`
- **Value**: (copy from your `.env` file - starts with `GOCSPX-`)
- **Environment**: All three ✓
- Click "Save"

### 6. OPENAI_API_KEY
- **Key**: `OPENAI_API_KEY`
- **Value**: (copy from your `.env` file - starts with `sk-`)
- **Environment**: All three ✓
- Click "Save"

### 7. GEMINI_API_KEY
- **Key**: `GEMINI_API_KEY`
- **Value**: (copy from your `.env` file)
- **Environment**: All three ✓
- Click "Save"

### 8. REPLICATE_API_TOKEN
- **Key**: `REPLICATE_API_TOKEN`
- **Value**: (copy from your `.env` file)
- **Environment**: All three ✓
- Click "Save"

### 9. TOGETHER_API_KEY
- **Key**: `TOGETHER_API_KEY`
- **Value**: (copy from your `.env` file)
- **Environment**: All three ✓
- Click "Save"

### 10. AWS_ACCESS_KEY_ID
- **Key**: `AWS_ACCESS_KEY_ID`
- **Value**: (copy from your `.env` file)
- **Environment**: All three ✓
- Click "Save"

### 11. AWS_SECRET_ACCESS_KEY
- **Key**: `AWS_SECRET_ACCESS_KEY`
- **Value**: (copy from your `.env` file)
- **Environment**: All three ✓
- Click "Save"

### 12. AWS_BUCKET_NAME
- **Key**: `AWS_BUCKET_NAME`
- **Value**: (copy from your `.env` file - probably `createcolor-images`)
- **Environment**: All three ✓
- Click "Save"

### 13. AWS_REGION
- **Key**: `AWS_REGION`
- **Value**: (copy from your `.env` file - probably `us-east-1`)
- **Environment**: All three ✓
- Click "Save"

### 14. NEXT_PUBLIC_APP_URL ⚠️ IMPORTANT
- **Key**: `NEXT_PUBLIC_APP_URL`
- **Value**: `https://createandcolor.aivantageworks.com`
  - ⚠️ Use production domain, NOT localhost!
  - Or use `https://createcolor.vercel.app` if domain not ready
- **Environment**: All three ✓
- Click "Save"

---

## ✅ Step 4: Verify All Variables Added

After adding all 14 variables, scroll through the list and verify you see:
- ✓ MONGODB_URI
- ✓ NEXTAUTH_SECRET
- ✓ NEXTAUTH_URL
- ✓ GOOGLE_CLIENT_ID
- ✓ GOOGLE_CLIENT_SECRET
- ✓ OPENAI_API_KEY
- ✓ GEMINI_API_KEY
- ✓ REPLICATE_API_TOKEN
- ✓ TOGETHER_API_KEY
- ✓ AWS_ACCESS_KEY_ID
- ✓ AWS_SECRET_ACCESS_KEY
- ✓ AWS_BUCKET_NAME
- ✓ AWS_REGION
- ✓ NEXT_PUBLIC_APP_URL

---

## 🚀 Step 5: Redeploy

After saving all variables:

**Option 1: Automatic (Recommended)**
- Vercel will automatically redeploy
- Wait 2-3 minutes
- Check: https://createcolor.vercel.app

**Option 2: Manual**
```bash
npx vercel --prod
```

---

## 🧪 Step 6: Test Your App

Visit: **https://createcolor.vercel.app**

**Test Authentication:**
1. Go to: https://createcolor.vercel.app/login
2. Try "Sign in with Google" - should work!
3. Or create account with email/password

**Test Features:**
1. Go to: https://createcolor.vercel.app/create
2. Try creating a coloring page
3. Check storybook: https://createcolor.vercel.app/storybook

---

## 🎯 Quick Copy Reference

Your `.env` file has all these values. Just copy them to Vercel!

**Critical for Auth:**
- MONGODB_URI
- NEXTAUTH_SECRET
- NEXTAUTH_URL (change to production URL!)
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET

**Critical for Features:**
- OPENAI_API_KEY (coloring pages)
- GEMINI_API_KEY (storybooks)
- TOGETHER_API_KEY (storybooks)

**Optional but Recommended:**
- AWS credentials (for image storage)
- REPLICATE_API_TOKEN (magic lens)

---

## ⚠️ Common Mistakes to Avoid

1. **Using localhost URLs**
   - ❌ `NEXTAUTH_URL=http://localhost:3000`
   - ✅ `NEXTAUTH_URL=https://createandcolor.aivantageworks.com`

2. **Not checking all 3 environment boxes**
   - Must check: Production, Preview, Development

3. **Forgetting to redeploy**
   - Changes don't take effect until redeployed

4. **Copy-paste errors**
   - No extra spaces
   - No quotes around values (Vercel adds them)
   - Complete values (don't cut off)

---

## 🐛 Troubleshooting

### "Configuration error"
- Check all required variables are added
- Verify no typos in variable names
- Wait for redeploy to complete

### Google Sign-In not working
- Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct
- Check Google Cloud Console redirect URIs include production URL
- Make sure NEXTAUTH_URL is set to production domain

### "Cannot connect to database"
- Check MONGODB_URI is correct
- Verify MongoDB Atlas allows all IPs (0.0.0.0/0)

### Features not working
- Check API keys are valid
- Verify all keys are added to Vercel
- Check Vercel deployment logs for errors

---

## 📞 Need Help?

**While adding variables, if you get stuck:**
1. Take a screenshot of the Vercel page
2. Tell me which variable you're on
3. Let me know what's not working

**Your Vercel project URL:**
https://vercel.com/dashboard (look for "createcolor")

---

**Ready?** Open https://vercel.com/dashboard and let's do this! 🚀
