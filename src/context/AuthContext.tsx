// ✅ Generated following IndiBuddy project rules

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { useFirestoreContext } from './FirebaseProvider';
import { STORAGE_KEYS } from '@/lib/constants';

interface User {
  id: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (name: string, password: string) => Promise<void>;
  login: (name: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const firestore = useFirestoreContext();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check sessionStorage on mount and restore user session
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedUserId = sessionStorage.getItem(STORAGE_KEYS.USER_ID);
        if (savedUserId) {
          // Add timeout to prevent infinite loading
          const timeoutId = setTimeout(() => {
            console.warn('Firestore query timeout - clearing session');
            sessionStorage.removeItem(STORAGE_KEYS.USER_ID);
            setLoading(false);
          }, 10000); // 10 second timeout

          try {
            const userDocRef = doc(firestore, 'users', savedUserId);
            const userDoc = await getDoc(userDocRef);
            clearTimeout(timeoutId);
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setUser({
                id: userDoc.id,
                name: userData.name,
              });
            } else {
              // User document not found, clear session
              sessionStorage.removeItem(STORAGE_KEYS.USER_ID);
            }
          } catch (queryError) {
            clearTimeout(timeoutId);
            throw queryError;
          }
        } else {
          // No saved session, just set loading to false
          setLoading(false);
        }
      } catch (error) {
        console.error('Error restoring session:', error);
        // Clear session on any error
        sessionStorage.removeItem(STORAGE_KEYS.USER_ID);
        setLoading(false);
      }
    };

    restoreSession();
  }, [firestore]);

  const signup = async (name: string, password: string) => {
    // Check if username already exists
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where('name', '==', name));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      throw new Error('Username already exists');
    }

    // Create new user
    const newUserRef = await addDoc(usersRef, {
      name,
      password, // Plain text for simplicity
      createdAt: serverTimestamp(),
    });

    // Save user ID to sessionStorage
    sessionStorage.setItem(STORAGE_KEYS.USER_ID, newUserRef.id);

    // Set user state
    setUser({
      id: newUserRef.id,
      name,
    });
  };

  const login = async (name: string, password: string) => {
    // Query users collection
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where('name', '==', name));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('User not found');
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    // Compare passwords (plain text for simplicity)
    if (userData.password !== password) {
      throw new Error('Incorrect password');
    }

    // Save user ID to sessionStorage
    sessionStorage.setItem(STORAGE_KEYS.USER_ID, userDoc.id);

    // Set user state
    setUser({
      id: userDoc.id,
      name: userData.name,
    });
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem(STORAGE_KEYS.USER_ID);
  };

  const value: AuthContextType = {
    user,
    loading,
    signup,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

