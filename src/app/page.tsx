'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase, FirestorePermissionError, errorEmitter } from '@/firebase';
import { signInAnonymously, signOut } from 'firebase/auth';
import { doc, getDocs, collection, query, where, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';


export default function AuthPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);


  useEffect(() => {
    if (isClient && user && userProfile) {
      router.replace('/sites');
    }
  }, [isClient, user, userProfile, router]);

  const handleLoginOrSignup = () => {
    if (!name.trim()) {
        toast({
            variant: 'destructive',
            title: 'Invalid Input',
            description: 'Please enter a valid name.',
        });
        return;
    }
    
    setIsLoading(true);

    if (!auth) {
        toast({ variant: 'destructive', title: 'Error', description: "Auth service is not available." });
        setIsLoading(false);
        return;
    }
    
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where("name", "==", name));

    getDocs(q).then(querySnapshot => {
        if (querySnapshot.empty) {
            // --- NEW USER (SIGN UP) ---
            signInAnonymously(auth).then(({ user: authUser }) => {
                if (!authUser) throw new Error("Authentication failed. Please try again.");

                const newUserDocRef = doc(firestore, 'users', authUser.uid);
                const newUser: Omit<UserProfile, 'createdAt' | 'updatedAt'> = {
                    id: authUser.uid,
                    name: name,
                };
                const fullUserPayload = {
                  ...newUser,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                };

                setDoc(newUserDocRef, fullUserPayload).catch(error => {
                    const permissionError = new FirestorePermissionError({
                        path: newUserDocRef.path,
                        operation: 'create',
                        requestResourceData: fullUserPayload,
                    });
                    errorEmitter.emit('permission-error', permissionError);
                    setIsLoading(false);
                });

                toast({ title: 'Account Created!', description: 'Logged in successfully.' });
                router.push('/sites');

            }).catch(error => {
              console.error("Anonymous sign-in Error:", error);
              toast({ variant: 'destructive', title: 'Error', description: (error as Error).message || 'An unexpected error occurred during sign-in.' });
              setIsLoading(false);
            });

        } else {
            // --- EXISTING USER (LOGIN) ---
            const existingUserDoc = querySnapshot.docs[0];
            const oldUid = existingUserDoc.id;

            // Sign out any lingering session before creating a new one
            (auth.currentUser ? signOut(auth) : Promise.resolve()).then(() => {
                signInAnonymously(auth).then(({ user: newAuthUser }) => {
                    if (!newAuthUser) throw new Error("Authentication failed during login. Please try again.");
                    
                    const oldData = existingUserDoc.data();
                    const updatedData = {
                        ...oldData,
                        id: newAuthUser.uid, // Update the ID to the new auth user's UID
                        updatedAt: serverTimestamp(),
                    };

                    const newUserDocRef = doc(firestore, 'users', newAuthUser.uid);
                    
                    // Create the new document
                    setDoc(newUserDocRef, updatedData).then(() => {
                        // Mark the old document for deletion
                        const oldDocRef = doc(firestore, 'users', oldUid);
                        updateDoc(oldDocRef, { DELETED_AT: serverTimestamp() }).catch(deleteError => {
                            // Non-critical, just log it. The main login succeeded.
                            console.error("Failed to mark old user document for deletion:", deleteError);
                        });
                        
                        toast({ title: 'Logged In!', description: 'Welcome back.' });
                        router.push('/sites');

                    }).catch(error => {
                         const permissionError = new FirestorePermissionError({
                            path: newUserDocRef.path,
                            operation: 'create',
                            requestResourceData: updatedData,
                        });
                        errorEmitter.emit('permission-error', permissionError);
                        setIsLoading(false);
                    });

                }).catch(error => {
                    console.error("Anonymous sign-in Error on login:", error);
                    toast({ variant: 'destructive', title: 'Error', description: (error as Error).message || 'An unexpected error occurred during login.' });
                    setIsLoading(false);
                });
            });
        }
    }).catch(error => {
        const permissionError = new FirestorePermissionError({
            path: usersRef.path,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setIsLoading(false);
    });
  };
  
  const effectiveLoading = isUserLoading || isProfileLoading;

  if (!isClient || effectiveLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6 flex justify-center items-center h-[80vh]">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <Skeleton className="h-7 w-2/3 mx-auto" />
            <Skeleton className="h-4 w-full mx-auto" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (user && userProfile) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center">Welcome</CardTitle>
          <CardDescription className="text-center">
            Enter your name to login or sign up.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g., John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLoginOrSignup()}
            />
          </div>
          <Button onClick={handleLoginOrSignup} disabled={isLoading} className={cn('w-full btn-gradient-primary')}>
            {isLoading ? <Loader2 className="animate-spin" /> : 'Login / Sign Up'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
