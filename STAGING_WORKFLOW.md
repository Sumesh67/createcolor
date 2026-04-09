# Staging Workflow for CreateAndColor

## Overview
This document outlines the staging workflow to test API changes before deploying to production.

## Branch Structure
- `main` - Production branch (deploys to https://createcolor.vercel.app)
- `staging` - Staging branch (deploys to https://createcolor-staging.vercel.app)

## Workflow

### 1. Make API Changes in Staging Branch

```bash
# Switch to staging branch
git checkout staging

# Make your changes to API files
# e.g., edit src/app/api/generate/route.ts

# Commit changes
git add .
git commit -m "API: Your change description"
```

### 2. Deploy to Staging

```bash
# Deploy to Vercel preview/staging
npx vercel --prod

# OR if you have git remote:
git push origin staging
```

This will create a staging deployment at a Vercel URL.

### 3. Test with Mobile App

Update the mobile app to point to staging:

```typescript
// In createcolor-mobile/src/api/client.ts
const API_BASE_URL = 'https://createcolor-staging.vercel.app'; // Staging
// const API_BASE_URL = 'https://createcolor.vercel.app'; // Production
```

Run tests:
```bash
cd createcolor-mobile
npx expo start
```

Test all affected features in the simulator/device.

### 4. Verify Everything Works

- [ ] Test image generation without login
- [ ] Test image generation with login
- [ ] Test Magic Lens
- [ ] Test Storybook
- [ ] Check error messages
- [ ] Verify rate limits work

### 5. Merge to Production

Once testing is complete and everything works:

```bash
# Switch to main branch
git checkout main

# Merge staging into main
git merge staging

# Deploy to production
npx vercel --prod
```

### 6. Update Mobile App to Production

```typescript
// In createcolor-mobile/src/api/client.ts
const API_BASE_URL = 'https://createcolor.vercel.app'; // Production
```

## Important Notes

- **NEVER deploy directly to production without testing in staging first**
- Always test the mobile app against staging before merging to main
- Keep staging branch up to date with main when starting new features
- Document any breaking changes in commit messages

## Environment Variables

Staging and production should have the same environment variables configured in Vercel dashboard.

## Rollback Process

If production breaks:

```bash
# Find the last working commit
git log

# Revert to that commit
git revert <commit-hash>

# Deploy immediately
npx vercel --prod
```
