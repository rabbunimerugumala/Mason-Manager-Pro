'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { User } from '@/lib/types';

interface UserContextType {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  addUser: (name: string, password: string) => void;
  loginUser: (name: string, password: string) => boolean;
  clearCurrentUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USERS_KEY = 'mason-manager-users';
const CURRENT_USER_KEY = 'mason-manager-current-user';
const DATA_PREFIX = 'mason-manager-pro-data-';


export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // Clear all user and site data
      const savedUsersRaw = localStorage.getItem(USERS_KEY);
      if (savedUsersRaw) {
        const savedUsers = JSON.parse(savedUsersRaw) as User[];
        savedUsers.forEach(user => {
          localStorage.removeItem(`${DATA_PREFIX}${user.id}`);
        });
      }
      localStorage.removeItem(USERS_KEY);
      localStorage.removeItem(CURRENT_USER_KEY);

      // After clearing, set initial state to empty
      setUsers([]);
      setCurrentUser(null);

    } catch (error) {
      console.error("Failed to clear user data from localStorage", error);
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

  const addUser = useCallback((name: string, password: string) => {
    const newUser: User = {
      id: new Date().getTime().toString(),
      name,
      password,
    };
    setUsers(prev => [...prev, newUser]);
  }, []);

  const loginUser = useCallback((name: string, password: string): boolean => {
    const lowerCaseName = name.toLowerCase();
    const user = users.find(u => u.name.toLowerCase() === lowerCaseName && u.password === password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  }, [users]);
  
  const clearCurrentUser = useCallback(() => {
      setCurrentUser(null);
  }, []);

  const value = { users, currentUser, loading, addUser, loginUser, clearCurrentUser };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
