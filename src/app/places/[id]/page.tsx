'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Calendar, Minus, Plus, Save, ArrowLeft, Loader2 } from 'lucide-react';
import { format, startOfWeek, isWithinInterval, parseISO } from 'date-fns';

export default function PlaceDashboard() {
  const router = useRouter();
  const params = useParams();
  const { getPlaceById, addOrUpdateRecord, updatePlaceRates, loading } = useData();
  
  const placeId = Array.isArray(params.id) ? params.id[0] : params.id;
  const place = useMemo(() => getPlaceById(placeId), [placeId, getPlaceById]);

  const [today, setToday] = useState('');
  const [workerCount, setWorkerCount] = useState(0);
  const [labourerCount, setLabourerCount] = useState(0);
  const [workerRate, setWorkerRate] = useState(0);
  const [labourerRate, setLabourerRate] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const date = new Date();
    setToday(format(date, 'yyyy-MM-dd'));
    if (place) {
      const todayRecord = place.records.find(r => r.date === format(date, 'yyyy-MM-dd'));
      setWorkerCount(todayRecord?.workers || 0);
      setLabourerCount(todayRecord?.labourers || 0);
      setWorkerRate(place.workerRate);
      setLabourerRate(place.labourerRate);
    }
  }, [place]);

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

  const handleSaveRecord = () => {
    setIsSaving(true);
    addOrUpdateRecord(place.id, {
      date: today,
      workers: workerCount,
      labourers: labourerCount,
    });
    setTimeout(() => setIsSaving(false), 500);
  };
  
  const handleSaveRates = () => {
    updatePlaceRates(place.id, Number(workerRate), Number(labourerRate));
  };

  const todayPayment = workerCount * workerRate + labourerCount * labourerRate;
  
  const thisWeekRecords = place.records.filter(r => {
    const recordDate = parseISO(r.date);
    const todayDate = new Date();
    const start = startOfWeek(todayDate);
    const end = todayDate;
    return isWithinInterval(recordDate, { start, end });
  });

  const thisWeekPayment = thisWeekRecords.reduce((total, record) => {
    return total + (record.workers * place.workerRate + record.labourers * place.labourerRate);
  }, 0);


  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex items-center mb-6">
        <Button variant="outline" size="icon" className="mr-4" asChild>
            <Link href="/"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{place.name}</h1>
          <p className="text-muted-foreground">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Today's Attendance</CardTitle>
              <CardDescription>Use the buttons to log the number of workers and labourers for today.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="workers" className="text-lg">Workers</Label>
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="icon" onClick={() => setWorkerCount(p => Math.max(0, p - 1))}>
                    <Minus className="h-5 w-5" />
                  </Button>
                  <span id="workers" className="text-2xl font-bold w-12 text-center">{workerCount}</span>
                  <Button variant="outline" size="icon" onClick={() => setWorkerCount(p => p + 1)}>
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="labourers" className="text-lg">Labourers</Label>
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="icon" onClick={() => setLabourerCount(p => Math.max(0, p - 1))}>
                    <Minus className="h-5 w-5" />
                  </Button>
                  <span id="labourers" className="text-2xl font-bold w-12 text-center">{labourerCount}</span>
                  <Button variant="outline" size="icon" onClick={() => setLabourerCount(p => p + 1)}>
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <Button onClick={handleSaveRecord} disabled={isSaving} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-5 w-5" />}
                {place.records.some(r => r.date === today) ? 'Update Today\'s Record' : 'Save Today\'s Record'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Rates</CardTitle>
              <CardDescription>Set the daily payment rates for this site.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="worker-rate">Worker Rate ($)</Label>
                  <Input id="worker-rate" type="number" value={workerRate} onChange={e => setWorkerRate(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="labourer-rate">Labourer Rate ($)</Label>
                  <Input id="labourer-rate" type="number" value={labourerRate} onChange={e => setLabourerRate(Number(e.target.value))} />
                </div>
              </div>
              <Button onClick={handleSaveRates} className="w-full">
                <Save className="mr-2 h-5 w-5" />
                Save Rates
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Calculation</CardTitle>
              <CardDescription>Live cost estimation based on attendance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <div>
                <p className="text-muted-foreground">Today's Payment</p>
                <p className="text-3xl font-bold text-primary">${todayPayment.toFixed(2)}</p>
              </div>
              <Separator />
              <div>
                <p className="text-muted-foreground">This Week's Total</p>
                <p className="text-3xl font-bold text-primary">${thisWeekPayment.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
                <CardTitle>History Log</CardTitle>
                <CardDescription>View and manage past attendance records.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Button asChild variant="outline" className="w-full">
                    <Link href={`/places/${place.id}/history`}>
                        <Calendar className="mr-2 h-5 w-5" />
                        View Full History
                    </Link>
                </Button>
            </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
