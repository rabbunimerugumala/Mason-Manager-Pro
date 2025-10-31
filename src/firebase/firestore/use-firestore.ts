'use client';

import { useContext } from 'react';
import { useFirebase } from '@/firebase/provider';

/**
 * A hook to get the initialized Firestore instance.
 * Throws an error if Firestore is not available.
 */
export function useFirestore() {
  const { firestore } = useFirebase();
  if (!firestore) {
    // This can happen if the provider is not set up correctly
    // or if Firebase is still initializing on the client.
    // Components using this should handle the null case or be rendered
    // only when firebase is guaranteed to be available.
  }
  return firestore;
}
