# Deployment Guide for createandcolor.aivantageworks.com

This guide will help you deploy the CreateAndColor app to your domain: **createandcolor.aivantageworks.com**

## Prerequisites

- [x] Domain purchased: aivantageworks.com ✓
- [ ] Vercel account (free tier works)
- [ ] Access to domain DNS settings
- [ ] All environment variables ready

## Step 1: Deploy to Vercel

### Option A: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from your project directory**:
   ```bash
   cd /Users/deepawadhwani/Personal/Projects/createcolor
   vercel
   ```

4. **Follow the prompts**:
   - Setup and deploy? `Y`
   - Which scope? (Select your account)
   - Link to existing project? `N` (first time) or `Y` (if already exists)
   - Project name? `createandcolor` (or your preferred name)
   - Directory? `./` (press Enter)
   - Override settings? `N`

5. **Deploy to production**:
   ```bash
   vercel --prod
   ```

### Option B: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your Git repository (GitHub, GitLab, or Bitbucket)
4. Configure project:
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

## Step 2: Configure Environment Variables in Vercel

In the Vercel dashboard, go to **Project Settings → Environment Variables** and add:

### Required Variables:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/createcolor?retryWrites=true&w=majority

# NextAuth
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=https://createandcolor.aivantageworks.com

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AI APIs
OPENAI_API_KEY=sk-your-openai-api-key
GEMINI_API_KEY=your-gemini-api-key
REPLICATE_API_TOKEN=your-replicate-api-token
TOGETHER_API_KEY=your-together-api-key

# AWS S3
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_BUCKET_NAME=createcolor-images
AWS_REGION=us-east-1

# Public URL
NEXT_PUBLIC_APP_URL=https://createandcolor.aivantageworks.com
```

**Important Notes:**
- Set all variables to **Production** environment
- Use the same values from your local `.env` file
- Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to use your production domain

## Step 3: Configure Custom Domain in Vercel

1. Go to **Project Settings → Domains**
2. Click **Add Domain**
3. Enter: `createandcolor.aivantageworks.com`
4. Click **Add**

Vercel will provide DNS configuration instructions.

## Step 4: Configure DNS Settings

Go to your domain registrar (where you bought aivantageworks.com) and add these DNS records:

### DNS Configuration:

| Type  | Name          | Value                                    | TTL  |
|-------|---------------|------------------------------------------|------|
| CNAME | createandcolor| cname.vercel-dns.com                    | 3600 |

**OR if Vercel provides a different value, use:**

| Type  | Name          | Value                                    | TTL  |
|-------|---------------|------------------------------------------|------|
| CNAME | createandcolor| [your-project].vercel.app               | 3600 |

**Alternative A Record setup:**
| Type  | Name          | Value                                    | TTL  |
|-------|---------------|------------------------------------------|------|
| A     | createandcolor| 76.76.21.21                             | 3600 |

### DNS Propagation:
- DNS changes can take **5 minutes to 48 hours** to propagate
- Use [dnschecker.org](https://dnschecker.org) to verify propagation
- Check: `createandcolor.aivantageworks.com`

## Step 5: Update Google OAuth Redirect URIs

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your OAuth 2.0 Client ID
3. Under "Authorized redirect URIs", add:
   ```
   https://createandcolor.aivantageworks.com/api/auth/callback/google
   ```
4. Keep the localhost URI for development:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
5. Click **Save**

## Step 6: Verify Deployment

Once DNS has propagated, test your deployment:

1. **Visit your site**: https://createandcolor.aivantageworks.com
2. **Test authentication**:
   - Sign up with email/password ✓
   - Sign in with Google ✓
3. **Test features**:
   - Create coloring page ✓
   - Create storybook ✓
   - Gallery ✓
   - Magic Lens ✓

## Step 7: SSL Certificate

Vercel automatically provisions SSL certificates for custom domains.
- Your site will be accessible via HTTPS
- HTTP requests are automatically redirected to HTTPS
- Certificate auto-renews

## Troubleshooting

### Domain not working?
- Check DNS propagation: https://dnschecker.org
- Verify DNS records are correct in your domain registrar
- Wait up to 48 hours for DNS to propagate globally

### "Invalid redirect URI" error?
- Update Google OAuth settings with production URL
- Clear browser cache and cookies
- Check NEXTAUTH_URL in Vercel environment variables

### Database connection errors?
- Verify MONGODB_URI is correct in Vercel
- Check MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Or whitelist Vercel IP addresses

### Images not loading?
- Verify AWS S3 credentials in Vercel
- Check S3 bucket CORS settings
- Verify bucket permissions

## Continuous Deployment

Once connected to Git:
- **Push to main branch** → Automatic production deployment
- **Push to other branches** → Preview deployments
- Vercel provides preview URLs for each deployment

## Monitoring

- **Vercel Dashboard**: Monitor deployments, errors, and analytics
- **Logs**: View real-time function logs in Vercel dashboard
- **Analytics**: Enable Vercel Analytics for visitor insights

## Cost Considerations

**Vercel Free Tier includes:**
- Unlimited deployments
- 100GB bandwidth/month
- Serverless function executions
- Automatic SSL certificates
- Git integration

**AI API Costs (per storybook):**
- Gemini: ~$0.01
- FLUX (5 images): ~$0.025
- Total: ~$0.035 per storybook

**Daily Limits:**
- Coloring pages: 5 per user per day
- Storybooks: 2 per user per day

## Support

If you need help:
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com

---

**Deployment Date**: April 1, 2026
**Domain**: createandcolor.aivantageworks.com
**Platform**: Vercel
**Framework**: Next.js 14
