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
import { Calendar, Save, ArrowLeft, Loader2, Minus, Plus, Trash2 } from 'lucide-react';
import { format, startOfWeek, isWithinInterval, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Place, AdditionalCost } from '@/lib/types';
import { cn } from '@/lib/utils';


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
  const [additionalCosts, setAdditionalCosts] = useState<Array<Omit<AdditionalCost, 'id'>>>([{ description: '', amount: 0 }]);
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
      const savedCosts = todayRecord?.additionalCosts || [];
      setAdditionalCosts(savedCosts.length > 0 ? savedCosts.map(({id, ...rest}) => rest) : [{ description: '', amount: 0 }]);
      setWorkerRate(currentPlace.workerRate || 0);
      setLabourerRate(currentPlace.labourerRate || 0);
    }
  }, [placeId, getPlace, loading]);

  const handleSaveRecord = () => {
    if (!place) return;
    setIsSaving(true);
    const validAdditionalCosts = additionalCosts.filter(c => c.description && c.amount > 0);
    const { message } = addOrUpdateRecord(place.id, {
      date: today,
      workers: workerCount,
      labourers: labourerCount,
      additionalCosts: validAdditionalCosts,
    });
    toast({ title: 'Success', description: message });
    setTimeout(() => {
        setIsSaving(false);
        const updatedPlace = getPlace();
        if(updatedPlace) setPlace(updatedPlace);
    }, 500);
  };
  
  const handleSaveRates = () => {
    if (!place) return;
    updatePlaceRates(place.id, Number(workerRate) || 0, Number(labourerRate) || 0);
    toast({ title: 'Success', description: 'Payment rates updated.' });
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
  
  const thisWeekPayment = useMemo(() => {
    if (!place) return 0;
    const todayDate = new Date();
    const start = startOfWeek(todayDate, { weekStartsOn: 1 });
    const end = todayDate;
    const thisWeekRecords = place.records.filter(r => {
      try {
        const recordDate = parseISO(r.date);
        return isWithinInterval(recordDate, { start, end });
      } catch (e) {
        return false;
      }
    });

    return thisWeekRecords.reduce((total, record) => {
      const workerTotal = record.workers * (place.workerRate || 0);
      const labourerTotal = record.labourers * (place.labourerRate || 0);
      const newAdditionalCosts = (record.additionalCosts || []).reduce((acc, cost) => acc + (cost.amount || 0), 0);
      return total + workerTotal + labourerTotal + newAdditionalCosts;
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
            <Link href="/"><ArrowLeft className="h-4 w-4" /></Link>
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
                            placeholder="0"
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
              
              <Button onClick={handleSaveRecord} disabled={isSaving} className={cn("w-full btn-gradient-primary")}>
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
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="worker-rate">Worker Rate (Rs:)</Label>
                  <Input id="worker-rate" type="number" value={workerRate || ''} onChange={e => setWorkerRate(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="labourer-rate">Labourer Rate (Rs:)</Label>
                  <Input id="labourer-rate" type="number" value={labourerRate || ''} onChange={e => setLabourerRate(Number(e.target.value))} />
                </div>
              </div>
              <Button onClick={handleSaveRates} className={cn("w-full btn-gradient-primary")}>
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
