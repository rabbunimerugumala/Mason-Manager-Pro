'use client';

import { app, db, auth } from '@/firebase/config';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  // Firebase is already initialized in config.ts
  return {
    firebaseApp: app,
    firestore: db,
    auth: auth,
  };
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    firestore: db,
    auth: auth,
  };
}

