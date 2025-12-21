// ✅ Generated following IndiBuddy project rules

'use client';

import { initializeApp, FirebaseApp, getApps } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Only initialize on client-side to prevent build errors
let firebaseAppInstance: FirebaseApp | null = null;

const getApp = (): FirebaseApp => {
  // Skip initialization during SSR/build
  if (typeof window === 'undefined') {
    return {} as FirebaseApp;
  }

  if (!firebaseAppInstance) {
    const existingApps = getApps();
    firebaseAppInstance = existingApps.length > 0 
      ? existingApps[0] 
      : initializeApp(firebaseConfig);
  }
  return firebaseAppInstance;
};

// Initialize Firestore (lazy, client-side only)
export const db: Firestore = (() => {
  if (typeof window === 'undefined') {
    return {} as Firestore;
  }
  return getFirestore(getApp());
})();

// Initialize Auth (lazy, client-side only)
export const auth: Auth = (() => {
  if (typeof window === 'undefined') {
    return {} as Auth;
  }
  return getAuth(getApp());
})();

// Export app getter
export const app = getApp();
