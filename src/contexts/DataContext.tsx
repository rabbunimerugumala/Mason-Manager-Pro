
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Place, DailyRecord, AdditionalCost } from '@/lib/types';
import { useUser } from '@/contexts/UserContext';

// Helper function to get data from local storage
const getLocalStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key “${key}”:`, error);
    return defaultValue;
  }
};

// Helper function to set data in local storage
const setLocalStorage = <T>(key: string, value: T) => {
  if (typeof window === 'undefined') {
    console.warn('Tried setting localStorage key', key, 'but window is not available.');
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error setting localStorage key “${key}”:`, error);
  }
};


interface DataContextType {
  places: Place[];
  loading: boolean;
  addPlace: (place: Omit<Place, 'id' | 'records'>) => Promise<void>;
  updatePlace: (place: Place) => Promise<void>;
  deletePlace: (placeId: string) => Promise<void>;
  getPlaceById: (placeId: string) => Place | undefined;
  addOrUpdateRecord: (placeId: string, record: Omit<DailyRecord, 'id' | 'additionalCosts' | 'createdAt' | 'updatedAt'> & { additionalCosts?: Omit<AdditionalCost, 'id'>[] }) => Promise<void>;
  deleteRecord: (placeId: string, recordId: string) => Promise<void>;
  updatePlaceRates: (placeId: string, workerRate: number, labourerRate: number) => Promise<void>;
  clearData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  const dataKey = user ? `mason-manager-pro-data-${user.phone}` : null;

  useEffect(() => {
    if (dataKey) {
      setLoading(true);
      const storedPlaces = getLocalStorage<Place[]>(dataKey, []);
      setPlaces(storedPlaces);
      setLoading(false);
    } else {
      setPlaces([]);
    }
  }, [dataKey]);

  useEffect(() => {
    if (dataKey && !loading) {
      setLocalStorage(dataKey, places);
    }
  }, [places, dataKey, loading]);


  const addPlace = useCallback(async (placeData: Omit<Place, 'id' | 'records'>) => {
    if (!dataKey) throw new Error('User not logged in.');
    const newPlace: Place = {
      id: new Date().toISOString(),
      ...placeData,
      workerRate: placeData.workerRate || 0,
      labourerRate: placeData.labourerRate || 0,
      records: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPlaces(prev => [...prev, newPlace]);
  }, [dataKey]);

  const updatePlace = useCallback(async (updatedPlace: Place) => {
    if (!dataKey) throw new Error('User not logged in.');
    setPlaces(prev => prev.map(p => p.id === updatedPlace.id ? { ...updatedPlace, updatedAt: new Date().toISOString() } : p));
  }, [dataKey]);

  const deletePlace = useCallback(async (placeId: string) => {
    if (!dataKey) throw new Error('User not logged in.');
    setPlaces(prev => prev.filter(p => p.id !== placeId));
  }, [dataKey]);

  const getPlaceById = useCallback((placeId: string) => {
    return places.find(p => p.id === placeId);
  }, [places]);

  const addOrUpdateRecord = useCallback(async (placeId: string, recordData: Omit<DailyRecord, 'id'| 'additionalCosts'> & { additionalCosts?: Omit<AdditionalCost, 'id'>[] }) => {
      if (!dataKey) throw new Error("User not logged in.");
      
      setPlaces(prev => prev.map(p => {
        if (p.id === placeId) {
            const existingRecord = p.records.find(r => r.date === recordData.date);
            
            const newAdditionalCosts = (recordData.additionalCosts || [])
                .filter(cost => cost.description && cost.amount > 0)
                .map(cost => ({ ...cost, amount: Number(cost.amount), id: Math.random().toString() }));

            let newRecords;
            if (existingRecord) {
                // Update
                newRecords = p.records.map(r => r.id === existingRecord.id ? { ...existingRecord, ...recordData, additionalCosts: newAdditionalCosts, updatedAt: new Date().toISOString() } : r);
            } else {
                // Add
                const newRecord: DailyRecord = {
                    ...recordData,
                    id: new Date().toISOString(),
                    additionalCosts: newAdditionalCosts,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                newRecords = [...p.records, newRecord];
            }
            return {...p, records: newRecords, updatedAt: new Date().toISOString() };
        }
        return p;
      }));
  }, [dataKey]);


  const deleteRecord = useCallback(async (placeId: string, recordId: string) => {
    if (!dataKey) throw new Error("User not logged in.");
    setPlaces(prev => prev.map(p => {
        if (p.id === placeId) {
            return { ...p, records: p.records.filter(r => r.id !== recordId) };
        }
        return p;
    }));
  }, [dataKey]);

  const updatePlaceRates = useCallback(async (placeId: string, workerRate: number, labourerRate: number) => {
    if (!dataKey) throw new Error('User not logged in.');
    setPlaces(prev => prev.map(p => p.id === placeId ? { ...p, workerRate, labourerRate, updatedAt: new Date().toISOString() } : p));
  }, [dataKey]);

  const clearData = useCallback(async () => {
    if (!dataKey) return;
    setPlaces([]);
  }, [dataKey]);


  const value = { places, loading, addPlace, updatePlace, deletePlace, getPlaceById, addOrUpdateRecord, deleteRecord, updatePlaceRates, clearData };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
