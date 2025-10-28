
'use client';

import { useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useData } from '@/contexts/DataContext';
import { HistoryTable } from '@/components/records/HistoryTable';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileDown, Loader2, Share2 } from 'lucide-react';
import { generatePdf } from '@/lib/pdf-generator';
import type { Place } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { getWeek, getYear, parseISO, format, startOfWeek, endOfWeek, add, subDays, Day } from 'date-fns';
import { HistoryCard } from '@/components/records/HistoryCard';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { toPng, toJpeg } from 'html-to-image';
import { useToast } from '@/hooks/use-toast';

function getWeekMonToSat(date: Date) {
    const weekStartsOn: Day = 1; // Monday
    const start = startOfWeek(date, { weekStartsOn });
    const end = add(start, { days: 5 }); // Monday + 5 days = Saturday
    return { start, end };
}

export default function HistoryPage() {
  const params = useParams();
  const { getPlaceById, loading } = useData();
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const weeklyReportRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const placeId = Array.isArray(params.id) ? params.id[0] : params.id;
  const place = useMemo(() => getPlaceById(placeId), [placeId, getPlaceById]);

  const handleExportPdf = useCallback(() => {
    if (place) {
      generatePdf(place);
    }
  }, [place]);

  const handleShareJpg = useCallback((weekKey: string, weekLabel: string) => {
    const node = weeklyReportRefs.current[weekKey];
    if (node) {
      toast({ title: 'Generating Image...', description: 'Please wait a moment.' });
      toJpeg(node, { quality: 0.95, backgroundColor: 'white' })
        .then((dataUrl) => {
          const link = document.createElement('a');
          const safeWeekLabel = weekLabel.replace(/[^a-zA-Z0-9]/g, '-');
          link.download = `Weekly-Report-${place?.name}-${safeWeekLabel}.jpeg`;
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.error('oops, something went wrong!', err);
          toast({ variant: 'destructive', title: 'Error', description: 'Could not generate image.' });
        });
    }
  }, [place?.name, toast]);

  const weeklyGroupedRecords = useMemo(() => {
    if (!place?.records) return {};

    return place.records.reduce((acc, record) => {
      const recordDate = parseISO(record.date);
      // Adjust Saturday to be part of the preceding week if week starts on Monday
      const adjustedDate = recordDate.getDay() === 0 ? subDays(recordDate, 1) : recordDate;

      const weekNumber = getWeek(adjustedDate, { weekStartsOn: 1 });
      const year = getYear(adjustedDate);
      const weekKey = `${year}-W${weekNumber}`;

      if (!acc[weekKey]) {
        const { start, end } = getWeekMonToSat(adjustedDate);
        acc[weekKey] = {
          records: [],
          weekLabel: `Week of ${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`,
          total: 0,
        };
      }

      const workerCost = record.workers * (place?.workerRate || 0);
      const labourerCost = record.labourers * (place?.labourerRate || 0);
      const otherCosts = (record.additionalCosts || []).reduce((sum, cost) => sum + cost.amount, 0);
      const dailyTotal = workerCost + labourerCost + otherCosts;

      acc[weekKey].records.push(record);
      acc[weekKey].total += dailyTotal;

      return acc;
    }, {} as Record<string, { records: any[], weekLabel: string, total: number }>);
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

  const sortedWeeks = Object.keys(weeklyGroupedRecords).sort((a, b) => b.localeCompare(a));
  const defaultOpenWeek = sortedWeeks.length > 0 ? sortedWeeks[0] : undefined;

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center">
            <Button variant="outline" size="icon" className="mr-4 flex-shrink-0" asChild>
                <Link href={`/places/${place.id}`}><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">History Log</h1>
                <p className="text-muted-foreground truncate">{place.name}</p>
            </div>
        </div>
        <Button onClick={handleExportPdf} disabled={place.records.length === 0} className={cn('w-full sm:w-auto btn-gradient-primary')}>
            <FileDown className="mr-2 h-4 w-4" />
            Export as PDF
        </Button>
      </div>

      {place.records.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h2 className="text-xl font-semibold text-muted-foreground">No records found.</h2>
            <p className="text-muted-foreground mt-2">Manage daily attendance to see history here.</p>
        </div>
      ) : (
        <Accordion type="single" collapsible defaultValue={defaultOpenWeek} className="w-full space-y-4">
            {sortedWeeks.map(weekKey => (
              <Card key={weekKey} className="overflow-hidden">
                <div ref={el => weeklyReportRefs.current[weekKey] = el} className="bg-card">
                  <AccordionItem value={weekKey} className="border-none">
                    <AccordionTrigger className="p-4 sm:p-6 hover:no-underline bg-muted/50">
                      <div className="flex justify-between items-center w-full">
                          <div className="text-left">
                              <h3 className="font-semibold text-base sm:text-lg">{weeklyGroupedRecords[weekKey].weekLabel}</h3>
                              <p className="text-sm text-muted-foreground">{weeklyGroupedRecords[weekKey].records.length} record(s)</p>
                          </div>
                          <div className="text-right pl-2">
                            <p className="text-sm text-muted-foreground">Week Total</p>
                            <p className="font-bold text-base sm:text-lg text-primary">Rs: {weeklyGroupedRecords[weekKey].total.toFixed(2)}</p>
                          </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {isMobile ? (
                          <div className='p-4 space-y-4'>
                              {weeklyGroupedRecords[weekKey].records.sort((a,b) => b.date.localeCompare(a.date)).map(record => (
                                  <HistoryCard key={record.id} record={record} placeId={place.id}/>
                              ))}
                          </div>
                      ) : (
                        <HistoryTable records={weeklyGroupedRecords[weekKey].records} placeId={place.id} />
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </div>
                <CardFooter className="p-2 bg-muted/50 border-t">
                  <Button 
                    variant="link" 
                    className="text-primary"
                    onClick={() => handleShareJpg(weekKey, weeklyGroupedRecords[weekKey].weekLabel)}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Week as JPG
                  </Button>
                </CardFooter>
              </Card>
            ))}
        </Accordion>
      )}
    </div>
  );
}

    