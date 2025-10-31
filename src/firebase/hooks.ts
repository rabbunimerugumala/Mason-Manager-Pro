'use client';
import { useMemo, DependencyList } from 'react';
import {
  DocumentReference,
  Query,
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from 'firebase/firestore';

/**
 * A hook to memoize a Firestore query or document reference.
 * This is crucial to prevent infinite loops in `useEffect` when using
 * `useCollection` or `useDoc` with dynamically generated queries.
 *
 * @param factory A function that returns a Firestore query or document reference.
 * @param deps The dependency array for the `useMemo` hook.
 * @returns The memoized query or document reference.
 */
export function useMemoFirebase<T extends Query | DocumentReference | null>(
  factory: () => T,
  deps: DependencyList
): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
}
