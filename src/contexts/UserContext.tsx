'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { User } from '@/lib/types';

interface UserContextType {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  addUser: (name: string) => void;
  selectUser: (userId: string) => void;
  clearCurrentUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USERS_KEY = 'mason-manager-users';
const CURRENT_USER_KEY = 'mason-manager-current-user';

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUsers = localStorage.getItem(USERS_KEY);
      const savedCurrentUser = localStorage.getItem(CURRENT_USER_KEY);
      
      if (savedUsers) {
        setUsers(JSON.parse(savedUsers));
      }
      
      if (savedCurrentUser) {
        setCurrentUser(JSON.parse(savedCurrentUser));
      }
    } catch (error) {
      console.error("Failed to load user data from localStorage", error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        if (currentUser) {
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
        } else {
          localStorage.removeItem(CURRENT_USER_KEY);
        }
      } catch (error) {
        console.error("Failed to save user data to localStorage", error);
      }
    }
  }, [users, currentUser, loading]);

  const addUser = useCallback((name: string) => {
    const newUser: User = {
      id: new Date().getTime().toString(),
      name,
    };
    setUsers(prev => [...prev, newUser]);
  }, []);

  const selectUser = useCallback((userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  }, [users]);
  
  const clearCurrentUser = useCallback(() => {
      setCurrentUser(null);
  }, []);

  const value = { users, currentUser, loading, addUser, selectUser, clearCurrentUser };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
