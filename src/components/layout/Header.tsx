"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
  useMemoFirebase,
} from "@/firebase";
import { doc } from "firebase/firestore";
import type { UserProfile } from "@/lib/types";
import { signOut } from "firebase/auth";

export function Header() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  // State to hold the user ID from sessionStorage
  const [userIdFromStorage, setUserIdFromStorage] = useState<string | null>(
    null
  );
  const [isMounted, setIsMounted] = useState(false);

  // Read the user ID from sessionStorage on mount and whenever it might change
  useEffect(() => {
    setIsMounted(true);
    // Read immediately on mount
    const readStoredId = () => {
      if (typeof window !== "undefined") {
        const id = sessionStorage.getItem("mason-manager-user-id");
        console.log("Header: Reading from sessionStorage:", id);
        setUserIdFromStorage(id);
      }
    };

    readStoredId();

    // Also listen for storage changes (in case it's updated in another tab/window)
    window.addEventListener("storage", readStoredId);
    return () => window.removeEventListener("storage", readStoredId);
  }, []);

  // Use the stored user ID if available AND user is authenticated
  // Don't show the name if user is not authenticated (prevents showing stale data on login page)
  const actualUserId = user && userIdFromStorage ? userIdFromStorage : null;

  const userDocRef = useMemoFirebase(
    () => (actualUserId ? doc(firestore, "users", actualUserId) : null),
    [actualUserId, firestore]
  );
  const { data: userProfile, isLoading: isProfileLoading } =
    useDoc<UserProfile>(userDocRef);

  const handleLogout = async () => {
    await signOut(auth);
    sessionStorage.removeItem("mason-manager-user-id");
    setUserIdFromStorage(null);
    router.push("/");
  };

  const loading = isUserLoading || isProfileLoading || !isMounted;

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-card shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link
          href={user ? "/sites" : "/"}
          className="flex items-center space-x-2"
        >
          <Building2 className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block text-lg text-foreground">
            Manager Pro
          </span>
        </Link>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : user && userProfile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-muted-foreground" />
                <span className="font-semibold">{userProfile.name}</span>
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
    </header>
  );
}
