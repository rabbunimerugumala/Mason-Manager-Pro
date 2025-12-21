// ✅ Generated following IndiBuddy project rules

'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  CollectionReference,
  DocumentReference,
  FirestoreError,
  QuerySnapshot,
  DocumentSnapshot,
} from 'firebase/firestore';
import { useFirestoreContext } from '@/context/FirebaseProvider';

interface UseCollectionResult<T> {
  data: (T & { id: string })[] | null;
  loading: boolean;
  error: Error | null;
}

interface UseDocResult<T> {
  data: (T & { id: string }) | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to subscribe to a Firestore collection using a string path.
 * @param pathStr - Firestore path as string (e.g., "users/123/sites")
 * @returns Object with data, loading, and error states
 */
export function useCollection<T = any>(pathStr: string | null | undefined): UseCollectionResult<T> {
  const firestore = useFirestoreContext();
  const [data, setData] = useState<(T & { id: string })[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!pathStr) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const pathParts = pathStr.split('/').filter(Boolean);
      if (pathParts.length === 0) {
        throw new Error('Invalid path: path must contain at least one segment');
      }

      const collectionRef = collection(firestore, ...pathParts) as CollectionReference;

      const unsubscribe = onSnapshot(
        collectionRef,
        (snapshot: QuerySnapshot) => {
          const results: (T & { id: string })[] = [];
          snapshot.forEach((doc) => {
            results.push({
              ...(doc.data() as T),
              id: doc.id,
            });
          });
          setData(results);
          setLoading(false);
          setError(null);
        },
        (err: FirestoreError) => {
          setError(err);
          setData(null);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setData(null);
      setLoading(false);
    }
  }, [firestore, pathStr]);

  return { data, loading, error };
}

/**
 * Hook to subscribe to a Firestore document using a string path.
 * @param pathStr - Firestore path as string (e.g., "users/123")
 * @returns Object with data, loading, and error states
 */
export function useDoc<T = any>(pathStr: string | null | undefined): UseDocResult<T> {
  const firestore = useFirestoreContext();
  const [data, setData] = useState<(T & { id: string }) | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!pathStr) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const pathParts = pathStr.split('/').filter(Boolean);
      if (pathParts.length === 0) {
        throw new Error('Invalid path: path must contain at least one segment');
      }

      const docRef = doc(firestore, ...pathParts) as DocumentReference;

      const unsubscribe = onSnapshot(
        docRef,
        (snapshot: DocumentSnapshot) => {
          if (snapshot.exists()) {
            setData({
              ...(snapshot.data() as T),
              id: snapshot.id,
            });
          } else {
            setData(null);
          }
          setLoading(false);
          setError(null);
        },
        (err: FirestoreError) => {
          setError(err);
          setData(null);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setData(null);
      setLoading(false);
    }
  }, [firestore, pathStr]);

  return { data, loading, error };
}

