'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Calendar, Save, ArrowLeft, Loader2, Minus, Plus, Trash2 } from 'lucide-react';
import { format, startOfWeek } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Place, AdditionalCost, DailyRecord } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { doc, collection, query, where, serverTimestamp } from 'firebase/firestore';


export default function PlaceDashboard() {
  const params = useParams();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  
  const placeId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const [today, setToday] = useState('');
  const [workerCount, setWorkerCount]_useState(0);
  const [labourerCount, setLabourerCount] = useState(0);
  const [additionalCosts, setAdditionalCosts] = useState<Array<Omit<AdditionalCost, 'id'>>>([{ description: '', amount: 0 }]);
  const [workerRate, setWorkerRate] = useState<number | ''>('');
  const [labourerRate, setLabourerRate] = useState<number | ''>('');
  const [isSavingRecord, setIsSavingRecord] = useState(false);
  const [isSavingRates, setIsSavingRates] = useState(false);
  const [todayRecordId, setTodayRecordId] = useState<string | null>(null);

  const placeDocRef = useMemoFirebase(
    () => (user && placeId ? doc(firestore, 'users', user.uid, 'places', placeId) : null),
    [user, firestore, placeId]
  );
  const { data: place, isLoading: placeLoading } = useDoc<Place>(placeDocRef);

  useEffect(() => {
    const formattedDate = format(new Date(), 'yyyy-MM-dd');
    setToday(formattedDate);
  }, []);

  const todayRecordQuery = useMemoFirebase(() => {
    if (!placeDocRef || !today) return null;
    return query(collection(placeDocRef, 'dailyRecords'), where('date', '==', today));
  }, [placeDocRef, today]);

  const { data: todayRecords, isLoading: todayRecordLoading } = useCollection<DailyRecord>(todayRecordQuery);

  useEffect(() => {
    if (place) {
      setWorkerRate(place.workerRate || '');
      setLabourerRate(place.labourerRate || '');
    }
  }, [place]);
  
  useEffect(() => {
    if (todayRecords && todayRecords.length > 0) {
      const record = todayRecords[0];
      setWorkerCount(record.workers || 0);
      setLabourerCount(record.labourers || 0);
      const savedCosts = record.additionalCosts || [];
      setAdditionalCosts(savedCosts.length > 0 ? savedCosts.map(c => ({...c, amount: c.amount || 0})) : [{ description: '', amount: 0 }]);
      setTodayRecordId(record.id);
    } else {
      setWorkerCount(0);
      setLabourerCount(0);
      setAdditionalCosts([{ description: '', amount: 0 }]);
      setTodayRecordId(null);
    }
  }, [todayRecords]);

  const handleSaveRecord = () => {
    if (!place || !user) return;
    setIsSavingRecord(true);
    
    const validAdditionalCosts = additionalCosts.filter(c => c.description && c.amount > 0);
    const recordPayload = {
      date: today,
      workers: workerCount,
      labourers: labourerCount,
      additionalCosts: validAdditionalCosts,
      updatedAt: serverTimestamp(),
    };
    
    if (todayRecordId) {
      const recordRef = doc(placeDocRef!, 'dailyRecords', todayRecordId);
      updateDocumentNonBlocking(recordRef, recordPayload);
    } else {
      const recordsCollectionRef = collection(placeDocRef!, 'dailyRecords');
      addDocumentNonBlocking(recordsCollectionRef, {...recordPayload, createdAt: serverTimestamp() });
    }
    
    toast({ title: 'Success', description: "Record saved." });
    setIsSavingRecord(false);
  };
  
  const handleSaveRates = () => {
    if (!placeDocRef) return;
    setIsSavingRates(true);

    updateDocumentNonBlocking(placeDocRef, { 
        workerRate: Number(workerRate) || 0, 
        labourerRate: Number(labourerRate) || 0,
        updatedAt: serverTimestamp() 
    });
    toast({ title: 'Success', description: 'Payment rates updated.' });
    setIsSavingRates(false);
  };

  const handleAdditionalCostChange = (index: number, field: 'description' | 'amount', value: string | number) => {
    const newCosts = [...additionalCosts];
    const cost = newCosts[index];
    if (field === 'amount') {
      cost.amount = Number(value) || 0;
    } else {
      cost.description = String(value);
    }
    setAdditionalCosts(newCosts);
  };

  const addAdditionalCostField = () => {
    setAdditionalCosts([...additionalCosts, { description: '', amount: 0 }]);
  };
  
  const removeAdditionalCostField = (index: number) => {
    if (additionalCosts.length === 1 && index === 0) {
        setAdditionalCosts([{ description: '', amount: 0 }]);
        return;
    }
    const newCosts = additionalCosts.filter((_, i) => i !== index);
    setAdditionalCosts(newCosts);
  };

  const todayPayment = useMemo(() => {
    if (!place) return 0;
    const workersPayment = workerCount * (place.workerRate || 0);
    const labourersPayment = labourerCount * (place.labourerRate || 0);
    const otherCosts = additionalCosts.reduce((total, cost) => total + (Number(cost.amount) || 0), 0);
    return workersPayment + labourersPayment + otherCosts;
  }, [place, workerCount, labourerCount, additionalCosts]);

  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  
  const weeklyRecordsQuery = useMemoFirebase(() => {
      if (!placeDocRef) return null;
      return query(collection(placeDocRef, 'dailyRecords'), where('date', '>=', weekStart));
  }, [placeDocRef, weekStart]);

  const {data: thisWeekRecords } = useCollection<DailyRecord>(weeklyRecordsQuery);
  
  const thisWeekPayment = useMemo(() => {
    if (!place || !thisWeekRecords) return 0;
    
    return thisWeekRecords.reduce((total, record) => {
      const workerTotal = record.workers * (place.workerRate || 0);
      const labourerTotal = record.labourers * (place.labourerRate || 0);
      const newAdditionalCosts = (record.additionalCosts || []).reduce((acc, cost) => acc + (cost.amount || 0), 0);
      return total + workerTotal + labourerTotal + newAdditionalCosts;
    }, 0);
  }, [place, thisWeekRecords]);

  const loading = isUserLoading || placeLoading || todayRecordLoading;

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!place) {
    return (
      <div className="container mx-auto p-4 md:p-6 text-center">
        <h2 className="text-2xl font-bold">Place not found</h2>
        <Button asChild variant="link" className="mt-4"><Link href="/sites">Go back to sites</Link></Button>
      </div>
    );
  }
  
  const NumberStepper = ({ label, value, onIncrement, onDecrement }: { label: string, value: number, onIncrement: () => void, onDecrement: () => void }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onDecrement} className="h-10 w-10">
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          type="text"
          readOnly
          value={value}
          className="h-10 text-center text-lg font-bold"
        />
        <Button variant="outline" size="icon" onClick={onIncrement} className="h-10 w-10">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex items-center mb-6">
        <Button variant="outline" size="icon" className="mr-4 flex-shrink-0" asChild>
            <Link href="/sites"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">{place.name}</h1>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <NumberStepper 
                        label="Workers"
                        value={workerCount}
                        onIncrement={() => setWorkerCount(c => c + 1)}
                        onDecrement={() => setWorkerCount(c => Math.max(0, c - 1))}
                    />
                    <NumberStepper 
                        label="Labourers"
                        value={labourerCount}
                        onIncrement={() => setLabourerCount(c => c + 1)}
                        onDecrement={() => setLabourerCount(c => Math.max(0, c - 1))}
                    />
                </div>
                
                <Separator/>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Additional Costs</h3>
                   {additionalCosts.map((cost, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-6 sm:col-span-7 space-y-1">
                          <Label htmlFor={`cost-desc-${index}`} className={cn(index > 0 && "sr-only")}>Description</Label>
                          <Input 
                            id={`cost-desc-${index}`}
                            placeholder="e.g., Cement bags"
                            value={cost.description}
                            onChange={e => handleAdditionalCostChange(index, 'description', e.target.value)}
                          />
                        </div>
                        <div className="col-span-4 sm:col-span-3 space-y-1">
                           <Label htmlFor={`cost-amount-${index}`} className={cn(index > 0 && "sr-only")}>Amount (Rs:)</Label>
                          <Input
                            id={`cost-amount-${index}`}
                            type="number"
                            placeholder="Amount"
                            value={cost.amount || ''}
                            onChange={e => handleAdditionalCostChange(index, 'amount', e.target.value)}
                          />
                        </div>
                        <div className="col-span-2 flex items-center">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeAdditionalCostField(index)}
                            className="text-destructive hover:text-destructive h-10 w-10"
                           >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addAdditionalCostField}>
                    <Plus className="mr-2 h-4 w-4"/>
                    Add Cost
                  </Button>
                </div>
              
              <Button onClick={handleSaveRecord} disabled={isSavingRecord} className={cn("w-full btn-gradient-primary")}>
                {isSavingRecord ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-5 w-5" />}
                {todayRecordId ? 'Update Today\'s Record' : 'Save Today\'s Record'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Rates</CardTitle>
              <CardDescription>Set the daily payment rates for this site.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="worker-rate">Worker Rate (Rs:)</Label>
                  <Input id="worker-rate" type="number" placeholder="e.g., 1000" value={workerRate} onChange={e => setWorkerRate(e.target.value === '' ? '' : Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="labourer-rate">Labourer Rate (Rs:)</Label>
                  <Input id="labourer-rate" type="number" placeholder="e.g., 600" value={labourerRate} onChange={e => setLabourerRate(e.target.value === '' ? '' : Number(e.target.value))} />
                </div>
              </div>
              <Button onClick={handleSaveRates} disabled={isSavingRates} className={cn("w-full btn-gradient-primary")}>
                {isSavingRates ? <Loader2 className="animate-spin mr-2"/> : <Save className="mr-2 h-5 w-5" />}
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
                <p className="text-3xl font-bold text-primary">Rs: {todayPayment.toFixed(2)}</p>
              </div>
              <Separator />
              <div>
                <p className="text-muted-foreground">This Week's Total</p>
                <p className="text-3xl font-bold text-primary">Rs: {thisWeekPayment.toFixed(2)}</p>
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