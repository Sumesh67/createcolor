# CreateAndColor - Complete Project Documentation

## Overview

CreateAndColor is an AI-powered coloring page generator for kids. The project consists of two apps:
1. **Web App** - Next.js app deployed on Vercel
2. **iOS/Android App** - Expo React Native app published on App Store

---

## Project Locations

| Component | Path | Live URL |
|-----------|------|----------|
| Web App | `/Users/deepawadhwani/Personal/Projects/createColor` | https://createcolor.vercel.app |
| Mobile App | `/Users/deepawadhwani/Personal/Projects/createcolor-mobile` | [App Store](https://apps.apple.com/app/id6760249757) |

---

## Web App (Next.js)

### Tech Stack
- **Framework**: Next.js 14.2.35
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB (via Mongoose)
- **Authentication**: NextAuth.js
- **AI Image Generation**: Together AI (FLUX.1-schnell), Pollinations (fallback)
- **PDF Generation**: pdf-lib
- **Deployment**: Vercel

### Project Structure
```
createColor/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/                # API routes
│   │   │   ├── auth/           # NextAuth endpoints
│   │   │   ├── generate/       # AI image generation
│   │   │   ├── print/          # PDF generation with watermark
│   │   │   ├── gallery/        # User gallery CRUD
│   │   │   ├── edit/           # Image editing
│   │   │   ├── party-pack/     # Bulk generation
│   │   │   └── safety/         # Content moderation
│   │   ├── create/             # Main creation page
│   │   ├── gallery/            # User's saved pages
│   │   ├── community/          # Public gallery
│   │   ├── parent/             # Parent controls
│   │   ├── login/              # Authentication
│   │   ├── signup/             # Registration
│   │   ├── privacy/            # Privacy policy
│   │   ├── support/            # Support page
│   │   └── upload/             # Photo to coloring
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── PrintDialog.tsx
│   │   │   ├── SaveDialog.tsx
│   │   │   ├── ReviewPrompt.tsx  # App Store review prompt
│   │   │   └── ...
│   │   ├── kid-mode/           # Creation interface components
│   │   ├── parent/             # Parent dashboard components
│   │   └── layout/             # Layout components
│   ├── lib/
│   │   ├── db/                 # Database models & connection
│   │   │   ├── connect.ts      # MongoDB connection
│   │   │   └── models/         # Mongoose schemas
│   │   ├── auth.ts             # NextAuth configuration
│   │   └── utils.ts            # Utility functions
│   └── types/                  # TypeScript types
├── public/                     # Static assets
├── prisma/                     # Prisma schema (if used)
├── .env                        # Environment variables (DO NOT COMMIT)
├── .env.example                # Example env vars
├── vercel.json                 # Vercel configuration
└── package.json
```

### Environment Variables
```bash
# MongoDB Connection
MONGODB_URI=mongodb+srv://...

# NextAuth.js
NEXTAUTH_SECRET=<generated-secret>
NEXTAUTH_URL=https://createcolor.vercel.app

# Google OAuth
GOOGLE_CLIENT_ID=<google-client-id>
GOOGLE_CLIENT_SECRET=<google-client-secret>

# Together AI (primary image generation)
TOGETHER_API_KEY=<together-api-key>

# OpenAI (optional, for DALL-E)
OPENAI_API_KEY=sk-...

# AWS S3 (image storage)
AWS_ACCESS_KEY_ID=<aws-key>
AWS_SECRET_ACCESS_KEY=<aws-secret>
AWS_BUCKET_NAME=createcolor-images
AWS_REGION=us-east-1

# Public URL
NEXT_PUBLIC_APP_URL=https://createcolor.vercel.app
```

### Key Features
1. **Slot Machine** - Random prompt generation
2. **Voice Input** - Speech-to-image using Web Speech API
3. **Type It** - Manual text prompt
4. **AI Generation** - Together AI FLUX.1-schnell model
5. **Gallery** - Save and manage created pages
6. **Print** - PDF generation with watermark
7. **Share** - Web Share API integration
8. **Party Pack** - Bulk generation (20 pages)
9. **Review Prompt** - App Store rating after 5 prints

### Deployment Commands
```bash
# Development
npm run dev

# Build
npm run build

# Deploy to Vercel
npx vercel --prod
```

### Vercel Project Info
- **Project Name**: createcolor
- **Project ID**: prj_ANiem2HeldHc3K989ejs2UKPnucv
- **Team**: sumeshs-projects-c66b99fe

---

## Mobile App (Expo React Native)

### Tech Stack
- **Framework**: Expo SDK 54
- **Language**: TypeScript
- **Navigation**: React Navigation 6
- **Speech**: expo-speech-recognition
- **Storage**: expo-media-library, expo-file-system
- **Haptics**: expo-haptics

### Project Structure
```
createcolor-mobile/
├── App.tsx                     # Main app with tab navigation
├── src/
│   ├── screens/
│   │   ├── CreateScreen.tsx    # Main creation screen
│   │   ├── GalleryScreen.tsx   # Saved pages gallery
│   │   └── ParentScreen.tsx    # Parent controls
│   ├── api/                    # API calls to web backend
│   ├── components/             # Reusable components
│   ├── hooks/                  # Custom hooks
│   └── lib/                    # Utilities
├── assets/                     # App icons, splash screens
│   ├── icon.png                # App icon (1024x1024)
│   ├── splash-icon.png         # Splash screen
│   ├── android-icon-*.png      # Android adaptive icons
│   └── favicon.png             # Web favicon
├── app.json                    # Expo configuration
├── eas.json                    # EAS Build configuration
└── package.json
```

### App Configuration (app.json)
```json
{
  "expo": {
    "name": "CreateAndColor",
    "slug": "createandcolor",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.createandcolor.app",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.createandcolor.app",
      "versionCode": 1
    },
    "owner": "sumesh.pawar",
    "extra": {
      "eas": {
        "projectId": "ed748a84-8ded-429a-acef-0c00ceb73fea"
      }
    }
  }
}
```

### EAS Build Configuration (eas.json)
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": { "simulator": true }
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "ios": { "autoIncrement": true },
      "android": { "autoIncrement": true }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleTeamId": "W525J9VWSG"
      }
    }
  }
}
```

### App Store Information
- **App Store URL**: https://apps.apple.com/app/id6760249757
- **Apple ID**: 6760249757
- **Bundle ID**: com.createandcolor.app
- **Apple Team ID**: W525J9VWSG
- **EAS Project ID**: ed748a84-8ded-429a-acef-0c00ceb73fea
- **Expo Owner**: sumesh.pawar

### Build & Submit Commands
```bash
# Navigate to mobile app
cd /Users/deepawadhwani/Personal/Projects/createcolor-mobile

# Install dependencies
npm install

# Start development server
npx expo start

# Build for iOS (production)
npx eas build --platform ios --profile production

# Build for Android (production)
npx eas build --platform android --profile production

# Submit to App Store
npx eas submit --platform ios --profile production

# Submit to Play Store
npx eas submit --platform android --profile production
```

### Required Permissions
**iOS:**
- Microphone (voice input)
- Speech Recognition
- Photo Library (save images)

**Android:**
- RECORD_AUDIO
- READ/WRITE_EXTERNAL_STORAGE
- READ_MEDIA_IMAGES

---

## Database Schema (MongoDB)

### Collections

**users**
```javascript
{
  _id: ObjectId,
  email: String,
  password: String (hashed),
  name: String,
  createdAt: Date
}
```

**coloringpages**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  prompt: String,
  imageUrl: String,
  isPublic: Boolean,
  createdAt: Date
}
```

**printjobs**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  pageId: ObjectId,
  layout: String,
  pdfUrl: String,
  qrCode: String,
  status: String,
  createdAt: Date
}
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/generate` | Generate coloring page from prompt |
| POST | `/api/edit` | Edit existing image |
| GET | `/api/gallery` | Get user's saved pages |
| POST | `/api/gallery` | Save page to gallery |
| DELETE | `/api/gallery` | Delete page |
| PATCH | `/api/gallery` | Update page (public/private) |
| POST | `/api/print` | Generate PDF with watermark |
| POST | `/api/party-pack` | Generate 20 themed pages |
| POST | `/api/safety/flagged` | Report inappropriate content |
| POST | `/api/auth/signup` | User registration |
| * | `/api/auth/[...nextauth]` | NextAuth endpoints |

---

## Growth Features (Added March 2026)

1. **Share Button** - Gallery page has "Share with Parent" button using Web Share API
2. **PDF Watermark** - All PDFs include "Created for free at CreateColor.app"
3. **Review Prompt** - After 5 prints, shows App Store review popup
4. **SEO Optimization** - Keywords: "free coloring pages for kids", "AI coloring book", etc.
5. **App Store Link** - Homepage has App Store download button

---

## Accounts & Services

| Service | Purpose | Dashboard |
|---------|---------|-----------|
| Vercel | Web hosting | https://vercel.com |
| MongoDB Atlas | Database | https://cloud.mongodb.com |
| Together AI | Image generation | https://together.ai |
| Expo/EAS | Mobile builds | https://expo.dev |
| App Store Connect | iOS publishing | https://appstoreconnect.apple.com |
| Google Cloud | OAuth | https://console.cloud.google.com |
| AWS S3 | Image storage | https://aws.amazon.com |

---

## Contact Information

- **Support Email**: createandcolor.ai@gmail.com
- **Developer**: Sumesh Pawar
- **Expo Account**: sumesh.pawar

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Mar 2026 | Initial release - iOS app published |
| - | Mar 2026 | Added App Store link to website |
| - | Mar 2026 | Added growth features (share, watermark, review prompt, SEO) |

---

## Troubleshooting

### Web App
- **Build fails**: Check `npm run build` logs, ensure all env vars are set in Vercel
- **Auth not working**: Verify NEXTAUTH_SECRET and callback URLs
- **Images not generating**: Check Together AI API key and quota

### Mobile App
- **Build fails**: Run `npx eas build --platform ios --profile production --clear-cache`
- **App rejected**: Check Apple's rejection reason in App Store Connect
- **Permissions not working**: Ensure plugins are configured in app.json

### Common Issues
- **MongoDB connection**: Whitelist IP in Atlas, check connection string
- **Vercel deployment**: Check build logs at vercel.com
- **EAS builds**: Check build logs at expo.dev

---

*Last updated: March 16, 2026*
