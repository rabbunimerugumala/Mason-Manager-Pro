// ✅ Generated following IndiBuddy project rules

import { Skeleton } from '@/components/ui/skeleton';

export default function SitesLoading() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex flex-col space-y-3 p-6 rounded-lg border bg-card">
            <Skeleton className="h-6 w-3/4" />
            <div className="flex justify-between items-center pt-4">
              <Skeleton className="h-10 w-24" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-10 w-10" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

