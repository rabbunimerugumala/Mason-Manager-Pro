'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Edit, Trash2, Loader2 } from 'lucide-react';
import type { Place } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { PlaceForm } from './PlaceForm';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUser, useFirestore } from '@/firebase';
import { deleteDoc } from 'firebase/firestore';
import { doc, collection, getDocs, writeBatch } from 'firebase/firestore';

interface PlaceCardProps {
  place: Place;
}

export function PlaceCard({ place }: PlaceCardProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isMobile = useIsMobile();

  const handleDelete = async () => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
        return;
    }
    setIsDeleting(true);
    try {
        const placeRef = doc(firestore, 'users', user.uid, 'places', place.id);
        
        // Also delete subcollections like dailyRecords
        const recordsRef = collection(placeRef, 'dailyRecords');
        const recordsSnap = await getDocs(recordsRef);
        const batch = writeBatch(firestore);
        recordsSnap.forEach(snap => {
            batch.delete(snap.ref);
        });
        await batch.commit();

        deleteDoc(placeRef)
          .then(() => {
            toast({ title: 'Success', description: 'Work site and all its records deleted.' });
          })
          .catch((error) => {
            toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to delete site.' });
          });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message || 'Could not delete site.' });
    } finally {
        setIsDeleting(false);
    }
  };

  const EditPlaceDialog = () => (
    <>
      <DialogHeader>
        <DialogTitle>Edit Work Site</DialogTitle>
      </DialogHeader>
      <PlaceForm place={place} setModalOpen={setEditModalOpen} />
    </>
  );

  const EditPlaceDrawer = () => (
    <>
      <DrawerHeader>
        <DrawerTitle>Edit Work Site</DrawerTitle>
      </DrawerHeader>
       <div className="p-4">
        <PlaceForm place={place} setModalOpen={setEditModalOpen} />
      </div>
    </>
  );

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl font-bold truncate">{place.name}</CardTitle>
        <CardDescription>
            Manage your daily records.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Worker Rate:</span>
          <span className="font-semibold text-foreground">Rs: {place.workerRate}/day</span>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Labourer Rate:</span>
          <span className="font-semibold text-foreground">Rs: {place.labourerRate}/day</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button asChild className={cn('btn-gradient-primary')}>
          <Link href={`/places/${place.id}`}>Manage Site</Link>
        </Button>
        <div className="flex items-center space-x-2">
            {isMobile ? (
                <Drawer open={isEditModalOpen} onOpenChange={setEditModalOpen}>
                    <DrawerTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit Place</span>
                        </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                        <EditPlaceDrawer />
                    </DrawerContent>
                </Drawer>
            ) : (
                <Dialog open={isEditModalOpen} onOpenChange={setEditModalOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit Place</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <EditPlaceDialog />
                    </DialogContent>
                </Dialog>
            )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon">
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                <span className="sr-only">Delete Place</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the work site "{place.name}" and all its records. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                  {isDeleting ? <Loader2 className="animate-spin mr-2" /> : null}
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  );
}