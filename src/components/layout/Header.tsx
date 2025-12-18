"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { Building2, LogOut, Settings, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import {
  useAuth,
  useDoc,
  useFirestore,
  useUser,
} from "@/firebase";
import { doc } from "firebase/firestore";
import type { UserProfile } from "@/lib/types";
import { signOut } from "firebase/auth";
import { STORAGE_KEYS } from "@/lib/constants";

export function Header() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const [storedUserId, setStoredUserId] = useState<string | null>(null);

  // Get user ID from sessionStorage (this is what the login flow uses)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = sessionStorage.getItem(STORAGE_KEYS.USER_ID);
      setStoredUserId(id);
      
      // Also check periodically in case it was set after component mount
      const checkStorage = () => {
        const currentId = sessionStorage.getItem(STORAGE_KEYS.USER_ID);
        if (currentId !== storedUserId) {
          setStoredUserId(currentId);
        }
      };
      
      // Check immediately and then periodically
      const interval = setInterval(checkStorage, 100);
      
      // Listen for storage changes (in case it's updated in another tab/window)
      const handleStorageChange = () => {
        const newId = sessionStorage.getItem(STORAGE_KEYS.USER_ID);
        setStoredUserId(newId);
      };
      window.addEventListener('storage', handleStorageChange);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [storedUserId]);

  // Use stored user ID first (from login flow), then fall back to auth UID
  const userIdToUse = storedUserId || user?.uid || null;
  
  // Use the user ID to get the profile document
  const userDocRef = useMemo(
    () => (userIdToUse ? doc(firestore, "users", userIdToUse) : null),
    [userIdToUse, firestore]
  );
  const { data: userProfile, isLoading: isProfileLoading, error: profileError } =
    useDoc<UserProfile>(userDocRef);

  // Debug logging to help diagnose
  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      console.log('[Header] Debug Info:', {
        storedUserId,
        authUid: user.uid,
        userIdToUse,
        userProfile,
        isProfileLoading,
        profileError: profileError?.message,
        docPath: userDocRef?.path
      });
    }
  }, [user, storedUserId, userIdToUse, userProfile, isProfileLoading, profileError, userDocRef]);

  const handleLogout = async () => {
    await signOut(auth);
    sessionStorage.removeItem(STORAGE_KEYS.USER_ID);
    router.push("/");
  };

  const loading = isUserLoading;
  const hasUser = !!user;
  
  // Determine display name - prioritize userProfile.name
  const displayName = userProfile?.name || (isProfileLoading ? 'Loading...' : 'User');

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-card shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link
          href={hasUser ? "/sites" : "/"}
          className="flex items-center space-x-2"
        >
          <Building2 className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block text-lg text-foreground">
            Manager Pro
          </span>
        </Link>
        <div className="flex items-center min-w-[100px] justify-end">
          {loading ? (
            <Skeleton className="h-8 w-24" />
          ) : hasUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 hover:bg-accent">
                  <UserIcon className="h-5 w-5 text-muted-foreground" />
                  <span className="font-semibold text-foreground">
                    {displayName}
                  </span>
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
          ) : null}
        </div>
      </div>
    </header>
  );
}
