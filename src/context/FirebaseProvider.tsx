// ✅ Generated following IndiBuddy project rules

'use client';

import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { Firestore } from 'firebase/firestore';
import { db } from '@/firebase/config';

interface FirebaseContextType {
  firestore: Firestore;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

interface FirebaseProviderProps {
  children: ReactNode;
}

export function FirebaseProvider({ children }: FirebaseProviderProps) {
  const value = useMemo(
    () => ({
      firestore: db,
    }),
    []
  );

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirestoreContext(): Firestore {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirestoreContext must be used within FirebaseProvider');
  }
  return context.firestore;
}

