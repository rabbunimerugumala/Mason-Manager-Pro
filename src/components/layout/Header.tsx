'use client';

import Link from 'next/link';
import { Building2, LogOut, Settings, User as UserIcon, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '../ui/button';
import { useAuth } from '@/firebase/provider';
import { useUser } from '@/firebase';

export function Header() {
  const { data: user, isLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
    }
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-card shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href={user ? "/sites" : "/"} className="flex items-center space-x-2">
          <Building2 className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block text-lg text-foreground">
            Mason Manager Pro
          </span>
        </Link>
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        ) : user && (
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5 text-muted-foreground" />
                    <span className='font-semibold'>{user.displayName || user.email}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        )}
      </div>
    </header>
  );
}
