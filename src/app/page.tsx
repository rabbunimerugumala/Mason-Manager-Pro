'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';


export default function AuthPage() {
  const { loginUser, addUser, loading: userLoading, currentUser } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const [loginName, setLoginName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [signupName, setSignupName] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  
  // This state will help us avoid hydration errors
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // If the user is already logged in, redirect them to the sites page.
    if (isClient && !userLoading && currentUser) {
      router.replace('/sites');
    }
  }, [isClient, userLoading, currentUser, router]);

  const handleLogin = () => {
    if (!loginName || !loginPassword) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter both username and password.' });
      return;
    }
    setIsLoggingIn(true);
    setTimeout(() => {
        const loggedIn = loginUser(loginName, loginPassword);
        if (loggedIn) {
            toast({ title: 'Success', description: 'Logged in successfully.' });
            router.push('/sites');
        } else {
            toast({ variant: 'destructive', title: 'Error', description: 'Invalid username or password.' });
        }
        setIsLoggingIn(false);
    }, 500);
  };

  const handleSignup = () => {
    if (!signupName || !signupPassword) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter both username and password.' });
      return;
    }
    if (signupPassword.length < 4) {
        toast({ variant: 'destructive', title: 'Error', description: 'Password must be at least 4 characters.' });
        return;
    }

    setIsSigningUp(true);
    setTimeout(() => {
        const { success, message } = addUser({ name: signupName, password: signupPassword });
        if (success) {
            toast({ title: 'Success', description: message });
            // Automatically log in the user after signup
            const loggedIn = loginUser(signupName, signupPassword);
            if(loggedIn) {
                router.push('/sites');
            }
        } else {
            toast({ variant: 'destructive', title: 'Error', description: message });
        }
        setIsSigningUp(false);
    }, 500);
  };
  
  if (!isClient || userLoading || currentUser) {
    return (
        <div className="container mx-auto p-4 md:p-6 flex justify-center items-center h-[80vh]">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <Skeleton className="h-7 w-2/3 mx-auto" />
                    <Skeleton className="h-4 w-full mx-auto" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex justify-center border-b">
                        <Skeleton className="h-10 w-20 m-1" />
                        <Skeleton className="h-10 w-20 m-1" />
                    </div>
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
    )
  }

  const renderPasswordField = (
    value: string, 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, 
    show: boolean, 
    setShow: (s: boolean) => void,
    id: string,
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  ) => (
    <div className="relative">
      <Input
        id={id}
        type={show ? 'text' : 'password'}
        placeholder="********"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
        onClick={() => setShow(!show)}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto p-4 md:p-6 flex justify-center items-center min-h-[80vh]">
      <Tabs defaultValue="login" className="w-full max-w-sm">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Login to Your Account</CardTitle>
              <CardDescription className="text-center">
                Enter your username and password to access your work sites.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-name">Username</Label>
                <Input
                  id="login-name"
                  placeholder="e.g., John Doe"
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                {renderPasswordField(loginPassword, (e) => setLoginPassword(e.target.value), showLoginPassword, setShowLoginPassword, "login-password", (e) => e.key === 'Enter' && handleLogin())}
              </div>
              <Button onClick={handleLogin} disabled={isLoggingIn} className={cn('w-full btn-gradient-primary')}>
                {isLoggingIn ? <Loader2 className="animate-spin"/> : 'Login'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Create a New Account</CardTitle>
              <CardDescription className="text-center">
                Choose a username and password to get started.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Username</Label>
                <Input
                  id="signup-name"
                  placeholder="e.g., Jane Smith"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                 {renderPasswordField(signupPassword, (e) => setSignupPassword(e.target.value), showSignupPassword, setShowSignupPassword, "signup-password", (e) => e.key === 'Enter' && handleSignup())}
              </div>
              <Button onClick={handleSignup} disabled={isSigningUp} className={cn('w-full btn-gradient-primary')}>
                {isSigningUp ? <Loader2 className="animate-spin"/> : 'Sign Up'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
