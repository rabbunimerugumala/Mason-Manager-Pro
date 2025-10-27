'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Edit, Trash2 } from 'lucide-react';
import type { Place } from '@/lib/types';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { PlaceForm } from './PlaceForm';
import { useToast } from '@/hooks/use-toast';

interface PlaceCardProps {
  place: Place;
}

export function PlaceCard({ place }: PlaceCardProps) {
  const { deletePlace } = useData();
  const { toast } = useToast();
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  const handleDelete = () => {
    deletePlace(place.id);
    toast({ title: 'Success', description: 'Work site deleted.' });
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl font-bold truncate">{place.name}</CardTitle>
        <CardDescription>
            {place.records.length} record(s)
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Worker Rate:</span>
          <span className="font-semibold text-foreground">${place.workerRate}/day</span>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Labourer Rate:</span>
          <span className="font-semibold text-foreground">${place.labourerRate}/day</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href={`/places/${place.id}`}>Manage Site</Link>
        </Button>
        <div className="flex items-center space-x-2">
          <Dialog open={isEditModalOpen} onOpenChange={setEditModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit Place</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Work Site</DialogTitle>
              </DialogHeader>
              <PlaceForm place={place} setModalOpen={setEditModalOpen} />
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon">
                <Trash2 className="h-4 w-4" />
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
