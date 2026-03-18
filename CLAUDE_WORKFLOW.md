# Claude Code Workflow Rules

**This document defines the workflow rules for Claude Code when working on this project.**

---

## Golden Rules

1. **NEVER push to git automatically** - Only push when user explicitly says "push", "commit", or "deploy"
2. **Always test locally first** - Run `npm run build` before any push
3. **Keep changes local by default** - All edits stay local until push is requested
4. **Pre-push hook is installed** - It will block pushes if build fails

---

## Development Workflow

### Step 1: Make Changes
Edit files as needed. All changes are local.

### Step 2: Test in Development Mode
```bash
npm run dev
```
Opens at http://localhost:3000

### Step 3: Verify Production Build
```bash
npm run build
```
This catches errors BEFORE using Vercel credits.

### Step 4: Push (ONLY when explicitly requested)
```bash
git add . && git commit -m "message" && git push
```

---

## Quick Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (hot reload) |
| `npm run build` | Test production build locally |
| `npm run start` | Run production build locally |
| `npx tsc --noEmit` | Type check only (fast) |

---

## Cost Saving Measures

### Vercel
- Preview deployments are **disabled** (only `main` branch deploys)
- Pre-push hook prevents failed builds from being pushed
- Each Vercel build costs ~$0.50-2.00

### Together AI (Storybook)
- Using Llama-3.2-3B for text (cheapest)
- Using Llama-3.2-11B-Vision with 512x512 images
- Using story templates instead of full AI generation
- FLUX steps reduced to 2

---

## Git Hook Location

Pre-push hook: `.git/hooks/pre-push`

What it does:
1. Runs `npm run build`
2. If build fails → Push is **blocked**
3. If build succeeds → Push proceeds

---

## When User Says...

| User Says | Claude Does |
|-----------|-------------|
| "make a change" | Edit files locally only |
| "test it" | Run `npm run dev` or `npm run build` |
| "push" / "commit" / "deploy" | Run git add, commit, push |
| "deploy to vercel" | Run `npx vercel --prod` |

---

## Project Paths

| Project | Path |
|---------|------|
| Web App | `/Users/deepawadhwani/Personal/Projects/createColor` |
| Mobile App | `/Users/deepawadhwani/Personal/Projects/createcolor-mobile` |

---

## Checklist Before Push

- [ ] Changes tested with `npm run dev`
- [ ] Production build passes: `npm run build`
- [ ] User explicitly requested push
- [ ] Commit message is descriptive

---

*This file should be read at the start of every Claude Code session.*
