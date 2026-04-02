# Quick Deploy to createandcolor.aivantageworks.com

## 🚀 Fast Track Deployment (5 Steps)

### 1. Deploy to Vercel (2 minutes)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd /Users/deepawadhwani/Personal/Projects/createcolor
vercel --prod
```

### 2. Add Environment Variables to Vercel

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Copy all variables from your local `.env` file, but change:
- `NEXTAUTH_URL` → `https://createandcolor.aivantageworks.com`
- `NEXT_PUBLIC_APP_URL` → `https://createandcolor.aivantageworks.com`

### 3. Add Custom Domain

In Vercel Dashboard → Domains → Add Domain:
```
createandcolor.aivantageworks.com
```

### 4. Configure DNS

Add this DNS record at your domain registrar:

**Type**: CNAME
**Name**: createandcolor
**Value**: cname.vercel-dns.com (or the value Vercel provides)
**TTL**: 3600

### 5. Update Google OAuth

Add to authorized redirect URIs:
```
https://createandcolor.aivantageworks.com/api/auth/callback/google
```

## ✅ Done!

Wait 5-30 minutes for DNS propagation, then visit:
**https://createandcolor.aivantageworks.com**

---

For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)
