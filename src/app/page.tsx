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
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking, getDocumentsNonBlocking, FirestorePermissionError } from '@/firebase';
import { signInAnonymously, signOut } from 'firebase/auth';
import { doc, getDocs, collection, query, where, serverTimestamp } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';


export default function AuthPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const SESSION_KEY = 'mason-manager-user-id';

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

  const handleLogin = async () => {
    if (!name.trim() || password.length < 8) {
        toast({
            variant: 'destructive',
            title: 'Invalid Input',
            description: 'Please enter a valid name and a password of at least 8 characters.',
        });
        return;
    }
    
    setIsLoading(true);
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where("name", "==", name));
    
    try {
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const existingUserDoc = querySnapshot.docs[0];
            const existingUser = existingUserDoc.data() as UserProfile;
            
            if (existingUser.password === password) {
                if (auth.currentUser) {
                  await signOut(auth);
                }
                const { user: authUser } = await signInAnonymously(auth);
                sessionStorage.setItem(SESSION_KEY, existingUserDoc.id);
                (auth as any).updateCurrentUser(authUser);
                toast({ title: 'Logged In!', description: 'Welcome back.' });
                router.push('/sites');
            } else {
                toast({ variant: 'destructive', title: 'Incorrect Password', description: 'The password for this user is incorrect.' });
                setIsLoading(false);
            }
        } else {
            if (auth.currentUser) {
              await signOut(auth);
            }
            const { user: authUser } = await signInAnonymously(auth);
            const userId = authUser.uid; 
            
            const userData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'> = {
                name: name,
                password: password,
            };
            
            const newUserDocRef = doc(firestore, 'users', userId);
            const data = {
              ...userData,
              id: userId,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            };

            setDocumentNonBlocking(newUserDocRef, data, {});
            sessionStorage.setItem(SESSION_KEY, userId);
            toast({ title: 'Account Created!', description: 'Logged in successfully.' });
            router.push('/sites');
        }
    } catch (error) {
        if (error instanceof FirestorePermissionError) {
          // Error is already emitted by the non-blocking function
        } else {
          toast({ variant: 'destructive', title: 'Error', description: (error as Error).message || 'An unexpected error occurred.' });
        }
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
            Enter your name and password to continue.
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
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="8+ characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>
          <Button onClick={handleLogin} disabled={isLoading} className={cn('w-full btn-gradient-primary')}>
            {isLoading ? <Loader2 className="animate-spin" /> : 'Login / Sign Up'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
