import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { DataProvider } from '@/contexts/DataContext';
import { UserProvider } from '@/contexts/UserContext';

export const metadata: Metadata = {
  title: 'Mason Manager Pro',
  description: 'Manage daily worker attendance, wages, and sites.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" crossOrigin="anonymous" />
      </head>
      <body className={cn('font-body antialiased bg-background text-foreground')}>
        <UserProvider>
          <DataProvider>
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
            </div>
            <Toaster />
          </DataProvider>
        </UserProvider>
      </body>
    </html>
  );
}
