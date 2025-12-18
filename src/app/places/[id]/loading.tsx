// ✅ Generated following IndiBuddy project rules

import { Skeleton } from '@/components/ui/skeleton';

export default function PlaceLoading() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center w-full">
          <Skeleton className="h-10 w-10 mr-4" />
          <div className="flex-grow">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border bg-card p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-4 w-full mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="rounded-lg border bg-card p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-4 w-full mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border bg-card p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <Skeleton className="h-4 w-full mb-6" />
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="rounded-lg border bg-card p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-4 w-full mb-6" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

