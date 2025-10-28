'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, User, Users } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UserSelectionPage() {
  const { users, addUser, selectUser, loading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');

  const handleCreateUser = () => {
    if (newUserName.trim()) {
      addUser(newUserName.trim());
      setNewUserName('');
      setCreateModalOpen(false);
      toast({ title: 'Success', description: 'New user profile created.' });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: 'User name cannot be empty.' });
    }
  };

  const handleSelectUser = (userId: string) => {
    selectUser(userId);
    router.push('/sites');
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center"><Users className="mr-3 h-8 w-8" /> User Profiles</h1>
        <Dialog open={isCreateModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className={cn('btn-gradient-primary')}>
              <PlusCircle className="mr-2 h-5 w-5" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New User Profile</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">User Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., John Doe"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateUser()}
                />
              </div>
              <Button onClick={handleCreateUser} className={cn('w-full btn-gradient-primary')}>Create User</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
             <div key={i} className="flex items-center space-x-4 p-6 rounded-lg border bg-card">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
          ))}
        </div>
      ) : users.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <Card 
                key={user.id} 
                onClick={() => handleSelectUser(user.id)}
                className="cursor-pointer hover:shadow-lg hover:border-primary transition-all"
            >
              <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                 <div className="flex-shrink-0 bg-secondary p-3 rounded-full">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                <CardTitle className="text-xl font-bold truncate">{user.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Select this profile to manage sites.</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold text-muted-foreground">No user profiles found.</h2>
          <p className="text-muted-foreground mt-2">Get started by creating a new user profile.</p>
        </div>
      )}
    </div>
  );
}
