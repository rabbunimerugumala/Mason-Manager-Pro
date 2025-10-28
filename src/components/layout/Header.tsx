'use client';

import Link from 'next/link';
import { Building2, User, SwitchCamera } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';

export function Header() {
  const { currentUser, clearCurrentUser } = useUser();
  const router = useRouter();

  const handleSwitchUser = () => {
    clearCurrentUser();
    router.push('/');
  }

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-card shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href={currentUser ? "/sites" : "/"} className="flex items-center space-x-2">
          <Building2 className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block text-lg text-foreground">
            Mason Manager Pro
          </span>
        </Link>
        {currentUser && (
           <div className='flex items-center gap-2 sm:gap-4'>
             <div className='flex items-center gap-2'>
                <User className="h-5 w-5 text-muted-foreground" />
                <span className='text-sm font-medium text-foreground hidden sm:inline'>{currentUser.name}</span>
             </div>
             <Button variant="outline" size="sm" onClick={handleSwitchUser}>
                <SwitchCamera className='mr-0 sm:mr-2 h-4 w-4' />
                <span className='hidden sm:inline'>Switch User</span>
             </Button>
           </div>
        )}
      </div>
    </header>
  );
}
