// ✅ Generated following IndiBuddy project rules

'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function PlaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Place dashboard error:', error);
  }, [error]);

  return (
    <div className="container mx-auto p-4 md:p-6 flex justify-center items-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>Failed to load site</CardTitle>
          </div>
          <CardDescription>
            There was an error loading the site dashboard. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button onClick={reset} className="w-full">
            Try again
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/sites">Back to sites</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

