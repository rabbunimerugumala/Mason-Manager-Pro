'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import type { Place } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlaceForm } from '@/components/places/PlaceForm';
import { PlaceCard } from '@/components/places/PlaceCard';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useUser } from '@/contexts/UserContext';

export default function SitesPage() {
  const { places, loading } = useData();
  const { currentUser } = useUser();
  const router = useRouter();
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    // If no user is selected, redirect to the user selection page
    if (!loading && !currentUser) {
      router.push('/');
    }
  }, [currentUser, loading, router]);


  if (!currentUser || loading) {
    return (
        <div className="container mx-auto p-4 md:p-6">
             <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-10 w-36" />
             </div>
             <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex flex-col space-y-3 p-6 rounded-lg border bg-card">
                    <Skeleton className="h-6 w-3/4" />
                    <div className="flex justify-between items-center pt-4">
                        <Skeleton className="h-10 w-24" />
                        <div className="flex gap-2">
                        <Skeleton className="h-10 w-10" />
                        <Skeleton className="h-10 w-10" />
                        </div>
                    </div>
                    </div>
                ))}
            </div>
        </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Work Sites</h1>
        <Dialog open={isCreateModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className={cn('btn-gradient-primary')}>
              <PlusCircle className="mr-2 h-5 w-5" />
              Create Site
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Work Site</DialogTitle>
            </DialogHeader>
            <PlaceForm setModalOpen={setCreateModalOpen} />
          </DialogContent>
        </Dialog>
      </div>

      {places.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {places.map((place: Place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold text-muted-foreground">No work sites found.</h2>
          <p className="text-muted-foreground mt-2">Get started by creating a new site.</p>
        </div>
      )}
    </div>
  );
}
