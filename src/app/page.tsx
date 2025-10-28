'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2 } from 'lucide-react';

export default function AuthPage() {
  const { users, addUser, loginUser } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signupName, setSignupName] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const handleLogin = () => {
    if (loginUser(loginName, loginPassword)) {
      toast({ title: 'Success', description: 'Logged in successfully.' });
      router.push('/sites');
    } else {
      toast({ variant: 'destructive', title: 'Error', description: 'Invalid username or password.' });
    }
  };

  const handleSignup = () => {
    if (signupName.trim() && signupPassword.trim()) {
       if (users.some(u => u.name.toLowerCase() === signupName.trim().toLowerCase())) {
        toast({ variant: 'destructive', title: 'Error', description: 'Username already exists.' });
        return;
      }
      addUser(signupName.trim(), signupPassword.trim());
      toast({ title: 'Success', description: 'Account created successfully. Please log in.' });
      // Switch to login tab after successful signup
      // This is a bit of a hack, might need a better way if tabs are controlled
      document.querySelector('[data-state="inactive"]')?.scrollIntoView();
      setSignupName('');
      setSignupPassword('');
    } else {
      toast({ variant: 'destructive', title: 'Error', description: 'All fields are required.' });
    }
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center justify-center text-center mb-6">
            <Building2 className="h-12 w-12 text-primary mb-3" />
            <h1 className="text-3xl font-bold">Mason Manager Pro</h1>
            <p className="text-muted-foreground">Manage your construction sites with ease.</p>
        </div>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>Enter your credentials to access your account.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-name">User Name</Label>
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
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="********"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>
                <Button onClick={handleLogin} className={cn('w-full btn-gradient-primary')}>Login</Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Create an Account</CardTitle>
                <CardDescription>Create a new profile to start managing your sites.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">User Name</Label>
                  <Input
                    id="signup-name"
                    placeholder="e.g., Jane Doe"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                  />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
                  />
                </div>
                <Button onClick={handleSignup} className={cn('w-full btn-gradient-primary')}>Sign Up</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
