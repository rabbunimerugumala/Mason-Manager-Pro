'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, useFirestore } from '@/firebase';
import { doc, collection, getDocs, writeBatch } from 'firebase/firestore';


export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !isUserLoading && !user) {
      router.replace('/');
    }
  }, [isClient, isUserLoading, user, router]);

  const handleClearData = async () => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You are not logged in.' });
        return;
    }
    setIsDeleting(true);
    try {
        const placesRef = collection(firestore, 'users', user.uid, 'places');
        const placesSnap = await getDocs(placesRef);
        const batch = writeBatch(firestore);

        for (const placeDoc of placesSnap.docs) {
            const recordsRef = collection(placeDoc.ref, 'dailyRecords');
            const recordsSnap = await getDocs(recordsRef);
            recordsSnap.forEach(snap => batch.delete(snap.ref));
            
            batch.delete(placeDoc.ref);
        }
        
        batch.delete(doc(firestore, 'users', user.uid));

        await batch.commit();

        toast({
          title: 'Data Cleared',
          description: 'All your site and record data has been deleted.',
        });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message || 'Could not clear data.' });
    } finally {
        setIsDeleting(false);
    }
  };
  
  if (!isClient || isUserLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return null; // Should be redirected by the effect
  }

  return (
    <div className="container mx-auto max-w-2xl p-4 md:p-6">
      <div className="flex items-center mb-6">
         <Button variant="outline" size="icon" className="mr-4 flex-shrink-0" asChild>
            <Link href="/sites"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Manage your application settings.</p>
        </div>
      </div>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            These actions are permanent and cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border border-destructive/50 p-4">
            <div className="mb-4 sm:mb-0 sm:mr-4">
              <h3 className="font-semibold">Clear All My Data</h3>
              <p className="text-sm text-muted-foreground">
                This will permanently delete all your work sites and records.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="shrink-0 w-full sm:w-auto">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all
                    of your data, including all work sites and their associated
                    records.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearData}
                    disabled={isDeleting}
                    className={cn(
                      'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                    )}
                  >
                    {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Yes, delete everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}