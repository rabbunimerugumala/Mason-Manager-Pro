'use client';

import Link from 'next/link';
import { Building2 } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-card shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href={"/"} className="flex items-center space-x-2">
          <Building2 className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block text-lg text-foreground">
            Mason Manager Pro
          </span>
        </Link>
      </div>
    </header>
  );
}
