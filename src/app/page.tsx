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
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
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

  const handleLoginOrSignup = async () => {
    if (!name.trim()) {
        toast({
            variant: 'destructive',
            title: 'Invalid Input',
            description: 'Please enter a valid name.',
        });
        return;
    }
    
    setIsLoading(true);
    
    try {
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where("name", "==", name));
        const querySnapshot = await getDocs(q);

        if (!auth) {
            throw new Error("Auth service is not available.");
        }

        if (querySnapshot.empty) {
            // --- NEW USER (SIGN UP) ---
            const { user: authUser } = await signInAnonymously(auth);
            if (!authUser) throw new Error("Authentication failed. Please try again.");

            const newUserDocRef = doc(firestore, 'users', authUser.uid);
            const newUser: Omit<UserProfile, 'createdAt' | 'updatedAt'> = {
                id: authUser.uid,
                name: name,
            };

            await setDoc(newUserDocRef, {
                ...newUser,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            toast({ title: 'Account Created!', description: 'Logged in successfully.' });
        } else {
            // --- EXISTING USER (LOGIN) ---
            const existingUserDoc = querySnapshot.docs[0];

            // Sign out any lingering session
            if (auth.currentUser) {
                await signOut(auth);
            }
            
            // Sign in with a new anonymous session
            const { user: newAuthUser } = await signInAnonymously(auth);
            if (!newAuthUser) throw new Error("Authentication failed during login. Please try again.");

            // Update the existing document with the new UID
            await updateDoc(existingUserDoc.ref, {
                id: newAuthUser.uid, // Associate the existing profile with the new auth user
                updatedAt: serverTimestamp(),
            });
            
            // Create a new document with the new UID and old data, then delete the old one
            const oldData = existingUserDoc.data();
            const newUserDocRef = doc(firestore, 'users', newAuthUser.uid);

            await setDoc(newUserDocRef, {
                ...oldData,
                id: newAuthUser.uid,
                updatedAt: serverTimestamp(),
            });

            await setDoc(existingUserDoc.ref, { DELETED: true }, { merge: true }); // Mark old doc for cleanup if needed

            toast({ title: 'Logged In!', description: 'Welcome back.' });
        }
        
        router.push('/sites');

    } catch (error) {
        console.error("Login/Signup Error:", error);
        if (error instanceof FirestorePermissionError) {
          throw error;
        }
        toast({ variant: 'destructive', title: 'Error', description: (error as Error).message || 'An unexpected error occurred.' });
    } finally {
        setIsLoading(false);
    }
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
