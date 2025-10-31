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
import 'react-phone-input-2/lib/style.css';
import PhoneInput from 'react-phone-input-2';
import { signInAnonymously } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';


export default function AuthPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
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

  const handleLogin = async () => {
    if (!name.trim() || !/^\d{10}$/.test(phone)) {
        toast({
            variant: 'destructive',
            title: 'Invalid Input',
            description: 'Please enter a valid name and a 10-digit phone number.',
        });
        return;
    }
    
    setIsLoading(true);
    try {
        const userCredential = await signInAnonymously(auth);
        const userId = userCredential.user.uid;
        
        const userDoc = doc(firestore, 'users', userId);
        
        // Check if a user document already exists, perhaps from a previous session
        const docSnap = await getDoc(userDoc);
        
        if (!docSnap.exists()) {
             await setDoc(userDoc, {
                id: userId,
                name: name,
                phoneNumber: phone,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }
        
        toast({ title: 'Success', description: 'Logged in successfully.' });
        router.push('/sites');

    } catch (error: any) {
      console.error("Login failed:", error);
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Could not log in.' });
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
  
  // If user is logged in and has a profile, they are redirected by the effect.
  // If they are logged in but have no profile yet (e.g., first login), show login form to create it.
  if (user && userProfile) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center">Welcome</CardTitle>
          <CardDescription className="text-center">
            Enter your name and 10-digit number to continue.
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
            <Label htmlFor="phone">10-Digit Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="1234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              maxLength={10}
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
