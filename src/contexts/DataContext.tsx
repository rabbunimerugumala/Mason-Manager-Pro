
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import type { Place, DailyRecord, AdditionalCost } from '@/lib/types';
import { useUser } from '@/firebase/auth/use-user.tsx';
import {
  collection,
  doc,
  writeBatch,
  serverTimestamp,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/hooks';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useFirestore as useFirestoreInstance } from '@/firebase/firestore/use-firestore';

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
  const { data: user } = useUser();
  const firestore = useFirestoreInstance();
  
  const [places, setPlaces] = useState<Place[]>([]);
  const [recordsByPlace, setRecordsByPlace] = useState<Record<string, DailyRecord[]>>({});
  const [loading, setLoading] = useState(true);

  const placesCollection = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'places');
  }, [firestore, user]);

  useEffect(() => {
    if (!placesCollection) {
      setPlaces([]);
      setLoading(false);
      return () => {};
    }

    setLoading(true);
    const unsubscribePlaces = onSnapshot(placesCollection, (snapshot) => {
      const placesData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Place));
      setPlaces(placesData);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching places:", error);
        setLoading(false);
    });

    return () => unsubscribePlaces();
  }, [placesCollection]);

  useEffect(() => {
    if (!firestore || !user || places.length === 0) {
      setRecordsByPlace({});
      return;
    }

    const unsubscribers: Unsubscribe[] = [];

    places.forEach(place => {
      const recordsCollection = collection(firestore, 'users', user.uid, 'places', place.id, 'records');
      const unsubscribe = onSnapshot(recordsCollection, (snapshot) => {
        const recordsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as DailyRecord));
        setRecordsByPlace(prev => ({ ...prev, [place.id]: recordsData }));
      }, (error) => {
        console.error(`Error fetching records for place ${place.id}:`, error);
      });
      unsubscribers.push(unsubscribe);
    });

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };

  }, [firestore, user, places]);


  const placesWithRecords = useMemo(() => {
    return places.map(place => ({
      ...place,
      records: recordsByPlace[place.id] || [],
    }));
  }, [places, recordsByPlace]);


  const addPlace = useCallback(async (placeData: Omit<Place, 'id' | 'records'>) => {
    if (!placesCollection) throw new Error('User not authenticated.');
    const newPlace = {
      ...placeData,
      workerRate: placeData.workerRate || 0,
      labourerRate: placeData.labourerRate || 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    addDoc(placesCollection, newPlace).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: placesCollection.path,
        operation: 'create',
        requestResourceData: newPlace,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw permissionError;
    });

  }, [placesCollection]);

  const updatePlace = useCallback(async (updatedPlace: Place) => {
    if (!placesCollection) throw new Error('User not authenticated.');
    const placeRef = doc(placesCollection, updatedPlace.id);
    const dataToUpdate = {
        name: updatedPlace.name,
        workerRate: updatedPlace.workerRate,
        labourerRate: updatedPlace.labourerRate,
        updatedAt: serverTimestamp()
    };
    updateDoc(placeRef, dataToUpdate).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: placeRef.path,
        operation: 'update',
        requestResourceData: dataToUpdate,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw permissionError;
    });
  }, [placesCollection]);

  const deletePlace = useCallback(async (placeId: string) => {
    if (!firestore || !user) throw new Error('User not authenticated.');
    const placeRef = doc(firestore, 'users', user.uid, 'places', placeId);
    
    const recordsCollection = collection(placeRef, 'records');
    const recordsSnapshot = await getDocs(recordsCollection);
    const batch = writeBatch(placeRef.firestore);
    recordsSnapshot.forEach(doc => {
        batch.delete(doc.ref);
    });
    batch.delete(placeRef);

    batch.commit().catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: placeRef.path,
        operation: 'delete'
      });
      errorEmitter.emit('permission-error', permissionError);
      throw permissionError;
    });
  }, [firestore, user]);

  const getPlaceById = useCallback((placeId: string) => {
    return placesWithRecords.find(p => p.id === placeId);
  }, [placesWithRecords]);

  const addOrUpdateRecord = useCallback(async (placeId: string, recordData: Omit<DailyRecord, 'id' | 'additionalCosts' | 'createdAt' | 'updatedAt'> & { additionalCosts?: Omit<AdditionalCost, 'id'>[] }) => {
      if (!firestore || !user) throw new Error("User not authenticated.");
      
      const place = placesWithRecords.find(p => p.id === placeId);
      if (!place) throw new Error("Place not found.");

      const recordsCol = collection(firestore, 'users', user.uid, 'places', placeId, 'records');

      const existingRecord = place.records.find(r => r.date === recordData.date);

      const newAdditionalCosts = (recordData.additionalCosts || [])
          .filter(cost => cost.description && cost.amount > 0)
          .map(cost => ({ ...cost, amount: Number(cost.amount) }));

      if (existingRecord) {
        const recordRef = doc(recordsCol, existingRecord.id);
        const dataToUpdate = {
          ...recordData,
          additionalCosts: newAdditionalCosts,
          updatedAt: serverTimestamp()
        };
        updateDoc(recordRef, dataToUpdate).catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: recordRef.path,
                operation: 'update',
                requestResourceData: dataToUpdate
            });
            errorEmitter.emit('permission-error', permissionError);
            throw permissionError;
        });
      } else {
        const newRecord = {
          ...recordData,
          additionalCosts: newAdditionalCosts,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        addDoc(recordsCol, newRecord).catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: recordsCol.path,
                operation: 'create',
                requestResourceData: newRecord
            });
            errorEmitter.emit('permission-error', permissionError);
            throw permissionError;
        });
      }
  }, [firestore, user, placesWithRecords]);


  const deleteRecord = useCallback(async (placeId: string, recordId: string) => {
    if (!firestore || !user) throw new Error("User not authenticated.");
    const recordRef = doc(firestore, 'users', user.uid, 'places', placeId, 'records', recordId);
    
    deleteDoc(recordRef).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: recordRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
        throw permissionError;
    });

  }, [firestore, user]);

  const updatePlaceRates = useCallback(async (placeId: string, workerRate: number, labourerRate: number) => {
    if (!placesCollection) throw new Error('User not authenticated.');
    const placeRef = doc(placesCollection, placeId);
    const dataToUpdate = { workerRate, labourerRate, updatedAt: serverTimestamp() };

    updateDoc(placeRef, dataToUpdate).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: placeRef.path,
            operation: 'update',
            requestResourceData: dataToUpdate
        });
        errorEmitter.emit('permission-error', permissionError);
        throw permissionError;
    });

  }, [placesCollection]);

  const clearData = useCallback(async () => {
    if (!firestore || !user) return;
    const placesCol = collection(firestore, 'users', user.uid, 'places');
    const snapshot = await getDocs(placesCol);
    const batch = writeBatch(firestore);
    
    for (const placeDoc of snapshot.docs) {
        const recordsCol = collection(placeDoc.ref, 'records');
        const recordsSnapshot = await getDocs(recordsCol);
        recordsSnapshot.forEach(recDoc => batch.delete(recDoc.ref));
        batch.delete(placeDoc.ref);
    }
    
    batch.commit().catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: placesCol.path,
        operation: 'delete',
      });
      errorEmitter.emit('permission-error', permissionError);
      throw permissionError;
    });

  }, [firestore, user]);


  const value = { places: placesWithRecords, loading, addPlace, updatePlace, deletePlace, getPlaceById, addOrUpdateRecord, deleteRecord, updatePlaceRates, clearData };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
