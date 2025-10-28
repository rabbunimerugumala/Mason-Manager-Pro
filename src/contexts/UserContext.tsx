'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { User } from '@/lib/types';

interface UserContextType {
  currentUser: User | null;
  users: User[];
  loading: boolean;
  loginUser: (name: string, pass: string) => boolean;
  logoutUser: () => void;
  addUser: (user: Omit<User, 'id'>) => { success: boolean, message: string };
  clearCurrentUserAllData: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USERS_KEY = 'mason-manager-users';
const CURRENT_USER_KEY = 'mason-manager-current-user';

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
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

  const addUser = useCallback((userData: Omit<User, 'id'>) => {
    const existingUser = users.find(u => u.name.toLowerCase() === userData.name.toLowerCase());
    if (existingUser) {
        return { success: false, message: 'Username already exists.' };
    }
    const newUser: User = { ...userData, id: new Date().getTime().toString() };
    setUsers(prev => [...prev, newUser]);
    return { success: true, message: 'Account created successfully!' };
  }, [users]);
  
  const loginUser = useCallback((name: string, pass: string) => {
    const user = users.find(u => u.name.toLowerCase() === name.toLowerCase() && u.password === pass);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  }, [users]);

  const logoutUser = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const clearCurrentUserAllData = useCallback(() => {
    if (currentUser) {
        const dataKey = `mason-manager-pro-data-${currentUser.name.toLowerCase()}`;
        localStorage.removeItem(dataKey);
    }
  }, [currentUser]);

  const value = { currentUser, users, loading, loginUser, logoutUser, addUser, clearCurrentUserAllData };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
