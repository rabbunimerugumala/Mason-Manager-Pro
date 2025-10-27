'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useData } from '@/contexts/DataContext';
import { HistoryTable } from '@/components/records/HistoryTable';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function HistoryPage() {
  const params = useParams();
  const { getPlaceById, loading } = useData();

  const placeId = Array.isArray(params.id) ? params.id[0] : params.id;
  const place = useMemo(() => getPlaceById(placeId), [placeId, getPlaceById]);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  if (!place) {
    return (
      <div className="container mx-auto p-4 md:p-6 text-center">
        <h2 className="text-2xl font-bold">Place not found</h2>
        <Button asChild variant="link" className="mt-4"><Link href="/">Go back to dashboard</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex items-center mb-6">
        <Button variant="outline" size="icon" className="mr-4" asChild>
            <Link href={`/places/${place.id}`}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">History Log</h1>
            <p className="text-muted-foreground">{place.name}</p>
        </div>
      </div>
      <HistoryTable records={place.records} placeId={place.id} />
    </div>
  );
}
