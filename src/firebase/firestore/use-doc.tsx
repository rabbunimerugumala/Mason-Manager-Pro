'use client';

import { useState, useEffect } from 'react';
import {
  onSnapshot,
  doc,
  DocumentReference,
  DocumentSnapshot,
  FirestoreError,
} from 'firebase/firestore';

interface DocData<T> {
  data: T | null;
  loading: boolean;
  error: FirestoreError | null;
}

export function useDoc<T>(
  ref: DocumentReference | null
): DocData<T> {
  const [docState, setDocState] = useState<DocData<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!ref) {
      setDocState({ data: null, loading: false, error: null });
      return;
    }

    const unsubscribe = onSnapshot(
      ref,
      (snapshot: DocumentSnapshot) => {
        if (snapshot.exists()) {
          const data = { ...snapshot.data(), id: snapshot.id } as T;
          setDocState({ data, loading: false, error: null });
        } else {
          setDocState({ data: null, loading: false, error: null });
        }
      },
      (error: FirestoreError) => {
        setDocState({ data: null, loading: false, error });
        console.error('Error fetching document:', error);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [ref]);

  return docState;
}
