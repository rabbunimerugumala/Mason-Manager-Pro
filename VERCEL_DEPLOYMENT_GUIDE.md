# Vercel Deployment Troubleshooting Guide

## Common Vercel Deployment Errors & Solutions

### 1. **Missing Environment Variables** (Most Common)

**Error**: `Firebase config not initialized` or `Cannot read property 'apiKey' of undefined`

**Solution**:
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add ALL these variables (copy from your `.env.local`):
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   NEXT_PUBLIC_FIREBASE_PROJECT_ID
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
   NEXT_PUBLIC_FIREBASE_APP_ID
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
   ```
4. Make sure to select **Production**, **Preview**, and **Development** environments
5. **Redeploy** after adding variables

### 2. **bcryptjs Build Errors**

**Error**: `Module not found: Can't resolve 'bcryptjs'` or build fails with bcryptjs

**Solution**: bcryptjs should work, but if you get errors, ensure it's in `dependencies` (not `devDependencies`). It already is, so this should be fine.

### 3. **TypeScript Build Errors**

**Error**: TypeScript compilation fails during build

**Solution**:
1. Run locally: `npm run typecheck`
2. Fix any TypeScript errors
3. Ensure `tsconfig.json` is properly configured
4. Commit and push changes

### 4. **Firebase Client-Side Only Code**

**Error**: `window is not defined` or Firebase initialization errors

**Solution**: Ensure all Firebase code is in `'use client'` components. Check:
- `src/firebase/config.ts` has `'use client'`
- All components using Firebase have `'use client'` directive

### 5. **Node.js Version Issues**

**Error**: Build fails with Node version errors

**Solution**: Create a `.nvmrc` or specify in `package.json`:
```json
"engines": {
  "node": ">=18.0.0"
}
```

### 6. **Build Script Issues**

**Error**: Build command fails

**Solution**: Vercel should automatically detect Next.js, but you can verify:
- Build Command: `npm run build` (or leave empty for auto-detection)
- Output Directory: `.next` (or leave empty for auto-detection)
- Install Command: `npm install` (or leave empty)

### 7. **Missing Dependencies**

**Error**: `Module not found` errors

**Solution**:
1. Ensure `package.json` has all dependencies
2. Run `npm install` locally to verify
3. Check that `node_modules` is in `.gitignore` (it should be)
4. Vercel will run `npm install` automatically

## Step-by-Step Vercel Deployment Checklist

### Before Deploying:

- [ ] All environment variables are set in Vercel dashboard
- [ ] `package.json` has correct build script
- [ ] TypeScript compiles without errors (`npm run typecheck`)
- [ ] Local build works (`npm run build`)
- [ ] All Firebase config values are correct
- [ ] Firestore database is created in Firebase Console
- [ ] Firestore security rules are published

### Deployment Steps:

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**
   - In project settings, add all `NEXT_PUBLIC_*` variables
   - Copy values from your `.env.local` file
   - Select all environments (Production, Preview, Development)

4. **Configure Build Settings** (usually auto-detected)
   - Framework Preset: Next.js
   - Build Command: `npm run build` (or leave empty)
   - Output Directory: `.next` (or leave empty)
   - Install Command: `npm install` (or leave empty)

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Check build logs for any errors

### After Deployment:

- [ ] Test the deployed app
- [ ] Verify Firebase connection works
- [ ] Test login/signup functionality
- [ ] Check browser console for errors
- [ ] Verify Firestore reads/writes work

## Quick Fixes for Common Errors

### Error: "Firebase config not initialized"

**Fix**: Add all environment variables in Vercel dashboard and redeploy.

### Error: "Permission denied" in Firestore

**Fix**: 
1. Go to Firebase Console → Firestore → Rules
2. Ensure rules allow read/write (for custom auth system)
3. Publish rules

### Error: Build timeout

**Fix**: 
1. Check build logs for specific errors
2. Ensure dependencies are not too large
3. Consider using Vercel Pro for longer build times

### Error: "Module not found: Can't resolve 'firebase/app'"

**Fix**: 
1. Ensure `firebase` is in `dependencies` (not `devDependencies`)
2. Run `npm install` locally to verify
3. Check `package.json` has `"firebase": "^12.7.0"`

## Vercel Configuration File (Optional)

You can create a `vercel.json` for custom configuration:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

## Need More Help?

1. Check Vercel build logs for specific error messages
2. Check browser console on deployed site
3. Verify all environment variables are set correctly
4. Ensure Firestore database is created and rules are published
5. Test locally first: `npm run build && npm start`

