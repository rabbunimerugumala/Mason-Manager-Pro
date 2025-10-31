'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2,LogIn, KeyRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useAuth } from '@/firebase/provider';
import { RecaptchaVerifier, signInWithPhoneNumber, updateProfile, ConfirmationResult } from 'firebase/auth';
import { useUser } from '@/firebase/auth/use-user.tsx';
import 'react-phone-input-2/lib/style.css';
import PhoneInput from 'react-phone-input-2';


declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export default function AuthPage() {
  const auth = useAuth();
  const { data: user, isLoading: userLoading } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // This state will help us avoid hydration errors
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // If the user is already logged in, redirect them to the sites page.
    if (isClient && !userLoading && user) {
      router.replace('/sites');
    }
  }, [isClient, userLoading, user, router]);

  const setupRecaptcha = () => {
    if (!auth) return;
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: (response: any) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        },
      });
    }
  };

  const handleSendOtp = async () => {
    if (!auth) return;
    if (!name || !phone) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter your name and phone number.' });
      return;
    }
    
    setIsSendingOtp(true);
    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier!;
      const confirmationResult = await signInWithPhoneNumber(auth, `+${phone}`, appVerifier);
      window.confirmationResult = confirmationResult;
      setOtpSent(true);
      toast({ title: 'OTP Sent', description: 'An OTP has been sent to your phone number.' });
    } catch (error: any) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to send OTP.' });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || !window.confirmationResult) return;
    setIsVerifyingOtp(true);
    try {
      const result = await window.confirmationResult.confirm(otp);
      const user = result.user;
      
      // Update user's profile with the name
      if (user) {
        await updateProfile(user, { displayName: name });
      }

      toast({ title: 'Success', description: 'Logged in successfully.' });
      router.push('/sites');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Invalid OTP.' });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  if (!isClient || userLoading || user) {
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

  return (
    <div className="container mx-auto p-4 md:p-6 flex justify-center items-center min-h-[80vh]">
       <div id="recaptcha-container"></div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center">Welcome</CardTitle>
          <CardDescription className="text-center">
            {otpSent ? 'Enter the OTP sent to your phone.' : 'Enter your name and number to login.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!otpSent ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <PhoneInput
                    country={'us'}
                    value={phone}
                    onChange={setPhone}
                    inputProps={{
                        id: 'phone',
                        name: 'phone',
                        required: true,
                        autoFocus: true,
                        className: 'w-full'
                    }}
                    containerClass="w-full"
                    inputClass="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                />
              </div>
              <Button onClick={handleSendOtp} disabled={isSendingOtp} className={cn('w-full btn-gradient-primary')}>
                {isSendingOtp ? <Loader2 className="animate-spin" /> : 'Send OTP'}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="otp">One-Time Password (OTP)</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                />
              </div>
              <Button onClick={handleVerifyOtp} disabled={isVerifyingOtp} className={cn('w-full btn-gradient-primary')}>
                {isVerifyingOtp ? <Loader2 className="animate-spin mr-2" /> : <KeyRound className="mr-2" />}
                Verify & Login
              </Button>
               <Button variant="link" onClick={() => setOtpSent(false)}>Back</Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
