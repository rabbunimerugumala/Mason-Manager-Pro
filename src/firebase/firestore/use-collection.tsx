'use client';

import { useState, useEffect } from 'react';
import {
  onSnapshot,
  query,
  collection,
  where,
  orderBy,
  limit,
  startAfter,
  Query,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  CollectionReference,
} from 'firebase/firestore';

interface CollectionData<T> {
  data: T[];
  loading: boolean;
  error: FirestoreError | null;
}

export function useCollection<T>(
  q: Query | CollectionReference | null
): CollectionData<T> {
  const [collectionState, setCollectionState] = useState<CollectionData<T>>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!q) {
      setCollectionState({ data: [], loading: false, error: null });
      return;
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const data: T[] = snapshot.docs.map(
          (doc) => ({ ...doc.data(), id: doc.id } as T)
        );
        setCollectionState({ data, loading: false, error: null });
      },
      (error: FirestoreError) => {
        setCollectionState({ data: [], loading: false, error });
        console.error('Error fetching collection:', error);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [q]);

  return collectionState;
}
