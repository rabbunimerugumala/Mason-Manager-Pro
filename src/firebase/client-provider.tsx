'use client';

import { ReactNode, useState, useEffect } from 'react';
import { initializeFirebase } from '@/firebase';
import { FirebaseProvider } from '@/firebase/provider';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

interface FirebaseInstances {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [instances, setInstances] = useState<FirebaseInstances | null>(null);

  useEffect(() => {
    // Initialize Firebase on the client and store the instances in state.
    // This ensures that it's only done once.
    const firebaseInstances = initializeFirebase();
    setInstances(firebaseInstances);
  }, []);

  // While Firebase is initializing, you can show a loader or null.
  // Once initialized, render the FirebaseProvider with the instances.
  if (!instances) {
    return null;
  }

  return (
    <FirebaseProvider app={instances.app} auth={instances.auth} firestore={instances.firestore}>
      {children}
    </FirebaseProvider>
  );
}
