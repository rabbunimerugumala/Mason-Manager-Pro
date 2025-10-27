'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Calendar, Save, ArrowLeft, Loader2 } from 'lucide-react';
import { format, startOfWeek, isWithinInterval, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Place } from '@/lib/types';

export default function PlaceDashboard() {
  const params = useParams();
  const { getPlaceById, addOrUpdateRecord, updatePlaceRates, loading } = useData();
  const { toast } = useToast();
  
  const placeId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const getPlace = useCallback(() => {
    return getPlaceById(placeId);
  }, [getPlaceById, placeId]);

  const [place, setPlace] = useState<Place | undefined>(getPlace());
  const [today, setToday] = useState('');
  const [workerCount, setWorkerCount] = useState(0);
  const [labourerCount, setLabourerCount] = useState(0);
  const [mutaCost, setMutaCost] = useState(0);
  const [machinesCost, setMachinesCost] = useState(0);
  const [workerRate, setWorkerRate] = useState(0);
  const [labourerRate, setLabourerRate] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const currentPlace = getPlace();
    setPlace(currentPlace);

    const date = new Date();
    const formattedDate = format(date, 'yyyy-MM-dd');
    setToday(formattedDate);

    if (currentPlace) {
      const todayRecord = currentPlace.records.find(r => r.date === formattedDate);
      setWorkerCount(todayRecord?.workers || 0);
      setLabourerCount(todayRecord?.labourers || 0);
      setMutaCost(todayRecord?.muta || 0);
      setMachinesCost(todayRecord?.machines || 0);
      setWorkerRate(currentPlace.workerRate);
      setLabourerRate(currentPlace.labourerRate);
    }
  }, [placeId, getPlace, loading]);

  const handleSaveRecord = () => {
    if (!place) return;
    setIsSaving(true);
    const { message } = addOrUpdateRecord(place.id, {
      date: today,
      workers: workerCount,
      labourers: labourerCount,
      muta: mutaCost,
      machines: machinesCost,
    });
    toast({ title: 'Success', description: message });
    setTimeout(() => setIsSaving(false), 500);
  };
  
  const handleSaveRates = () => {
    if (!place) return;
    updatePlaceRates(place.id, Number(workerRate), Number(labourerRate));
    toast({ title: 'Success', description: 'Payment rates updated.' });
  };

  const todayPayment = useMemo(() => {
    if (!place) return 0;
    const todayRecord = place.records.find(r => r.date === today);
    const workersPayment = (todayRecord?.workers || workerCount) * place.workerRate;
    const labourersPayment = (todayRecord?.labourers || labourerCount) * place.labourerRate;
    const mutaPayment = todayRecord?.muta || mutaCost;
    const machinesPayment = todayRecord?.machines || machinesCost;
    return workersPayment + labourersPayment + mutaPayment + machinesPayment;
  }, [place, today, workerCount, labourerCount, mutaCost, machinesCost]);
  
  const thisWeekPayment = useMemo(() => {
    if (!place) return 0;
    const todayDate = new Date();
    const start = startOfWeek(todayDate);
    const end = todayDate;
    const thisWeekRecords = place.records.filter(r => {
      const recordDate = parseISO(r.date);
      return isWithinInterval(recordDate, { start, end });
    });

    return thisWeekRecords.reduce((total, record) => {
      return total + (record.workers * place.workerRate + record.labourers * place.labourerRate + record.muta + record.machines);
    }, 0);
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
              <CardTitle>Today's Log</CardTitle>
              <CardDescription>Log attendance and other costs for today.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workers">Workers</Label>
                  <Input id="workers" type="number" value={workerCount} onChange={e => setWorkerCount(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="labourers">Labourers</Label>
                  <Input id="labourers" type="number" value={labourerCount} onChange={e => setLabourerCount(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="muta">Muta Work Cost (₹)</Label>
                  <Input id="muta" type="number" value={mutaCost} onChange={e => setMutaCost(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="machines">Machines Cost (₹)</Label>
                  <Input id="machines" type="number" value={machinesCost} onChange={e => setMachinesCost(Number(e.target.value))} />
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
                  <Label htmlFor="worker-rate">Worker Rate (₹)</Label>
                  <Input id="worker-rate" type="number" value={workerRate} onChange={e => setWorkerRate(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="labourer-rate">Labourer Rate (₹)</Label>
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
              <CardDescription>Live cost estimation based on today's log.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <div>
                <p className="text-muted-foreground">Today's Total Payment</p>
                <p className="text-3xl font-bold text-primary">₹{todayPayment.toFixed(2)}</p>
              </div>
              <Separator />
              <div>
                <p className="text-muted-foreground">This Week's Total</p>
                <p className="text-3xl font-bold text-primary">₹{thisWeekPayment.toFixed(2)}</p>
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
