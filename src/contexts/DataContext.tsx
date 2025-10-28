'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Place, DailyRecord, AdditionalCost } from '@/lib/types';
import { subDays, format } from 'date-fns';

interface DataContextType {
  places: Place[];
  loading: boolean;
  addPlace: (place: Omit<Place, 'id' | 'records'>) => void;
  updatePlace: (place: Place) => void;
  deletePlace: (placeId: string) => void;
  getPlaceById: (placeId: string) => Place | undefined;
  addOrUpdateRecord: (placeId: string, record: Omit<DailyRecord, 'id' | 'additionalCosts'> & { additionalCosts?: Omit<AdditionalCost, 'id'>[] }) => { success: boolean; message: string };
  deleteRecord: (placeId: string, recordId: string) => void;
  updatePlaceRates: (placeId: string, workerRate: number, labourerRate: number) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const generateMockRecords = () => {
  const records = [];
  for (let i = 0; i < 15; i++) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
    records.push({
      id: `1-${i + 1}`,
      date: date,
      workers: Math.floor(Math.random() * 5) + 8,
      labourers: Math.floor(Math.random() * 8) + 10,
      additionalCosts: Math.random() > 0.5 ? [{ id: `ac-${i}`, description: 'Cement', amount: Math.floor(Math.random() * 1000) + 500 }] : [],
    });
  }
  return records;
};

const initialPlaces: Place[] = [
  {
    id: '1',
    name: 'Downtown Skyscraper',
    workerRate: 1000,
    labourerRate: 600,
    records: generateMockRecords(),
  },
  {
    id: '2',
    name: 'Suburban Villa Complex',
    workerRate: 900,
    labourerRate: 550,
    records: [
       { id: '2-1', date: format(new Date(), 'yyyy-MM-dd'), workers: 8, labourers: 10, additionalCosts: [] },
    ],
  },
];

export function DataProvider({ children }: { children: ReactNode }) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedData = localStorage.getItem('mason-manager-pro-data');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (parsedData.length > 0) {
             const restoredPlaces = parsedData.map((p:any) => ({
              ...p,
              records: p.records.map((r: any) => ({
                id: r.id,
                date: r.date,
                workers: r.workers,
                labourers: r.labourers,
                additionalCosts: r.additionalCosts || [],
                // This ensures backward compatibility with old data structure
                ...(r.muta && { additionalCosts: [...(r.additionalCosts || []), {id: `muta-${r.id}`, description: 'Muta', amount: r.muta}] }),
                ...(r.machines && { additionalCosts: [...(r.additionalCosts || []), {id: `machines-${r.id}`, description: 'Machines', amount: r.machines}] }),
              })).map(({ muta, machines, ...rest }: any) => rest), // remove old fields
            }));
            setPlaces(restoredPlaces);
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
        const dataToSave = places.map(p => ({
            ...p,
            records: p.records.map(({muta, machines, ...rest}) => rest) // Ensure old fields are not saved
        }));
        localStorage.setItem('mason-manager-pro-data', JSON.stringify(dataToSave));
      } catch (error) {
        console.error("Failed to save data to localStorage", error);
      }
    }
  }, [places, loading]);

  const addPlace = useCallback((placeData: Omit<Place, 'id' | 'records'>) => {
    const newPlace: Place = {
      ...placeData,
      id: new Date().getTime().toString(),
      records: [],
      workerRate: placeData.workerRate || 0,
      labourerRate: placeData.labourerRate || 0
    };
    setPlaces(prev => [...prev, newPlace]);
  }, []);

  const updatePlace = useCallback((updatedPlace: Place) => {
    setPlaces(prev => prev.map(p => p.id === updatedPlace.id ? updatedPlace : p));
  }, []);

  const deletePlace = useCallback((placeId: string) => {
    setPlaces(prev => prev.filter(p => p.id !== placeId));
  }, []);

  const getPlaceById = useCallback((placeId: string) => {
    return places.find(p => p.id === placeId);
  }, [places]);

  const addOrUpdateRecord = useCallback((placeId: string, recordData: Omit<DailyRecord, 'id' | 'additionalCosts'> & { additionalCosts?: Omit<AdditionalCost, 'id'>[] }) => {
    let message = '';
    setPlaces(prev => prev.map(p => {
      if (p.id === placeId) {
        const existingRecordIndex = p.records.findIndex(r => r.date === recordData.date);
        let newRecords;

        const newAdditionalCosts = (recordData.additionalCosts || [])
          .filter(cost => cost.description && cost.amount > 0)
          .map(cost => ({
            ...cost,
            id: new Date().getTime().toString() + Math.random(),
        }));

        if (existingRecordIndex > -1) {
          newRecords = [...p.records];
          const existingRecord = newRecords[existingRecordIndex];
          newRecords[existingRecordIndex] = { 
            ...existingRecord, 
            ...recordData,
            additionalCosts: newAdditionalCosts,
          };
          message = "Today's record updated.";
        } else {
          const newRecord: DailyRecord = { 
            ...recordData, 
            id: new Date().getTime().toString(),
            additionalCosts: newAdditionalCosts,
          };
          newRecords = [...p.records, newRecord].sort((a, b) => b.date.localeCompare(a.date));
          message = "Today's record saved.";
        }
        return { ...p, records: newRecords };
      }
      return p;
    }));
    return { success: true, message };
  }, []);

  const deleteRecord = useCallback((placeId: string, recordId: string) => {
    setPlaces(prev => prev.map(p => {
      if (p.id === placeId) {
        return { ...p, records: p.records.filter(r => r.id !== recordId) };
      }
      return p;
    }));
  }, []);

  const updatePlaceRates = useCallback((placeId: string, workerRate: number, labourerRate: number) => {
    setPlaces(prev => prev.map(p => p.id === placeId ? { ...p, workerRate, labourerRate } : p));
  }, []);

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
