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
import { signInAnonymously, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDocs, collection, query, where, serverTimestamp, setDoc } from 'firebase/firestore';
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

    if (!auth || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Firebase service is not available.' });
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Always ensure a user is authenticated first.
      let authUser = auth.currentUser;
      if (!authUser) {
        const userCredential = await signInAnonymously(auth);
        authUser = userCredential.user;
      }
      
      if (!authUser) {
          throw new Error("Authentication failed. Please try again.");
      }

      // Step 2: Now that we are authenticated, query the database.
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where("name", "==", name));
      
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // --- NEW USER (SIGN UP) ---
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

        await setDoc(newUserDocRef, fullUserPayload);
        
        toast({ title: 'Account Created!', description: 'Logged in successfully.' });
        router.push('/sites');

      } else {
        // --- EXISTING USER (LOGIN) ---
        // In this anonymous auth model, we assume if the name exists, we log them in.
        // The existing user's data is already associated with their original UID.
        // We'll sign out the current temp user and sign in again to create a new session
        // associated with the existing data.
        const existingUserDoc = querySnapshot.docs[0];
        const existingUser = existingUserDoc.data() as UserProfile;
        
        // This is a simplified login. In a real app with passwords, you'd verify credentials here.
        // For this app, we just re-associate the session.
        sessionStorage.setItem('mason-manager-user-id', existingUser.id);
        
        // Force the provider to re-evaluate the user state
        if (auth.currentUser?.uid !== existingUser.id) {
          (auth as any).updateCurrentUser(null).then(() => {
              const fakeUser = { uid: existingUser.id } as FirebaseUser;
              (auth as any).updateCurrentUser(fakeUser);
          });
        }
        
        toast({ title: 'Logged In!', description: 'Welcome back.' });
        router.push('/sites');
      }
    } catch (error: any) {
      console.error("Login/Signup Error:", error);
      
      // Emit contextual error for Firestore permission issues
      if (error.code === 'permission-denied') {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: `users`,
            operation: 'list', // This is the most likely initial failure point
          })
        );
      } else {
        toast({
          variant: 'destructive',
          title: 'An error occurred',
          description: error.message || 'Could not complete login/signup.',
        });
      }
      
      // If something went wrong, sign out any partial anonymous session
      if (auth.currentUser) {
        await signOut(auth);
      }
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
