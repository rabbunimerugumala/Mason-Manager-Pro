'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';

interface AuthState {
  data: User | null;
  isLoading: boolean;
  error: Error | null;
}

export function useUser(): AuthState {
  const auth = useAuth();
  const [userState, setUserState] = useState<AuthState>({
    data: auth?.currentUser ?? null,
    isLoading: auth ? !auth.currentUser : true,
    error: null,
  });

  useEffect(() => {
    if (!auth) {
      setUserState({ data: null, isLoading: false, error: new Error('Firebase Auth is not initialized') });
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUserState({ data: user, isLoading: false, error: null });
      },
      (error) => {
        setUserState({ data: null, isLoading: false, error });
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth]);

  return userState;
}
