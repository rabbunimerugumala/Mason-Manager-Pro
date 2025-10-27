'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Place, DailyRecord } from '@/lib/types';
import { useToast } from "@/hooks/use-toast"

interface DataContextType {
  places: Place[];
  loading: boolean;
  addPlace: (place: Omit<Place, 'id' | 'records'>) => void;
  updatePlace: (place: Place) => void;
  deletePlace: (placeId: string) => void;
  getPlaceById: (placeId: string) => Place | undefined;
  addOrUpdateRecord: (placeId: string, record: Omit<DailyRecord, 'id'>) => void;
  deleteRecord: (placeId: string, recordId: string) => void;
  updatePlaceRates: (placeId: string, workerRate: number, labourerRate: number) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const initialPlaces: Place[] = [
  {
    id: '1',
    name: 'Downtown Skyscraper',
    workerRate: 25,
    labourerRate: 15,
    records: [
      { id: '1-1', date: '2024-07-20', workers: 10, labourers: 15, notes: 'Foundation work started.' },
      { id: '1-2', date: '2024-07-21', workers: 12, labourers: 18, notes: 'Heavy rain in the afternoon.' },
    ],
  },
  {
    id: '2',
    name: 'Suburban Villa Complex',
    workerRate: 22,
    labourerRate: 14,
    records: [
       { id: '2-1', date: '2024-07-21', workers: 8, labourers: 10, notes: 'Site cleared.' },
    ],
  },
];


export function DataProvider({ children }: { children: ReactNode }) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedData = localStorage.getItem('mason-manager-pro-data');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (parsedData.length > 0) {
            setPlaces(parsedData);
        } else {
            setPlaces(initialPlaces);
        }
      } else {
        setPlaces(initialPlaces);
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      setPlaces(initialPlaces);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem('mason-manager-pro-data', JSON.stringify(places));
      } catch (error) {
        console.error("Failed to save data to localStorage", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not save data. Your changes might be lost.",
        });
      }
    }
  }, [places, loading, toast]);

  const addPlace = useCallback((placeData: Omit<Place, 'id' | 'records'>) => {
    const newPlace: Place = {
      ...placeData,
      id: new Date().getTime().toString(),
      records: [],
    };
    setPlaces(prev => [...prev, newPlace]);
    toast({ title: "Success", description: "New work site created." });
  }, [toast]);

  const updatePlace = useCallback((updatedPlace: Place) => {
    setPlaces(prev => prev.map(p => p.id === updatedPlace.id ? updatedPlace : p));
    toast({ title: "Success", description: "Work site updated." });
  }, [toast]);

  const deletePlace = useCallback((placeId: string) => {
    setPlaces(prev => prev.filter(p => p.id !== placeId));
    toast({ title: "Success", description: "Work site deleted." });
  }, [toast]);

  const getPlaceById = useCallback((placeId: string) => {
    return places.find(p => p.id === placeId);
  }, [places]);

  const addOrUpdateRecord = useCallback((placeId: string, recordData: Omit<DailyRecord, 'id'>) => {
    setPlaces(prev => prev.map(p => {
      if (p.id === placeId) {
        const existingRecordIndex = p.records.findIndex(r => r.date === recordData.date);
        let newRecords;
        if (existingRecordIndex > -1) {
          // Update existing record for the date
          newRecords = [...p.records];
          newRecords[existingRecordIndex] = { ...newRecords[existingRecordIndex], ...recordData };
          toast({ title: "Success", description: "Today's record updated." });
        } else {
          // Add new record
          const newRecord: DailyRecord = { ...recordData, id: new Date().getTime().toString() };
          newRecords = [...p.records, newRecord].sort((a, b) => b.date.localeCompare(a.date));
          toast({ title: "Success", description: "Today's record saved." });
        }
        return { ...p, records: newRecords };
      }
      return p;
    }));
  }, [toast]);

  const deleteRecord = useCallback((placeId: string, recordId: string) => {
    setPlaces(prev => prev.map(p => {
      if (p.id === placeId) {
        return { ...p, records: p.records.filter(r => r.id !== recordId) };
      }
      return p;
    }));
    toast({ title: "Success", description: "Record deleted." });
  }, [toast]);

  const updatePlaceRates = useCallback((placeId: string, workerRate: number, labourerRate: number) => {
    setPlaces(prev => prev.map(p => p.id === placeId ? { ...p, workerRate, labourerRate } : p));
    toast({ title: "Success", description: "Payment rates updated." });
  }, [toast]);

  const value = { places, loading, addPlace, updatePlace, deletePlace, getPlaceById, addOrUpdateRecord, deleteRecord, updatePlaceRates };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
