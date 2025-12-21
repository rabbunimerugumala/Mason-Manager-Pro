// ✅ Generated following IndiBuddy project rules

"use client";

import Link from "next/link";
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
import { useAuth } from "@/context/AuthContext";

export function Header() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

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
        <div className="flex items-center min-w-[100px] justify-end">
          {loading ? (
            <Skeleton className="h-8 w-24" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 hover:bg-accent"
                >
                  <UserIcon className="h-5 w-5 text-muted-foreground" />
                  <span className="font-semibold text-foreground">
                    {user.name}
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
