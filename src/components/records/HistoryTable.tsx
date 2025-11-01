'use client';

import { useState } from 'react';
import { Edit, Loader2, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { DailyRecord, Place } from '@/lib/types';
import { RecordForm } from './RecordForm';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUser, useFirestore, deleteDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';


interface HistoryTableProps {
  records: DailyRecord[];
  place: Place;
}

export function HistoryTable({ records, place }: HistoryTableProps) {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const [editingRecord, setEditingRecord] = useState<DailyRecord | null>(null);
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);
  const isMobile = useIsMobile();


  const handleDelete = (recordId: string) => {
    if (!user) return;
    setDeletingRecordId(recordId);
    const recordRef = doc(firestore, 'users', user.uid, 'places', place.id, 'dailyRecords', recordId);
    deleteDocumentNonBlocking(recordRef);
    toast({ title: 'Success', description: 'Record deleted.' });
    setDeletingRecordId(null);
  };
  
  const sortedRecords = [...records].sort((a, b) => b.date.localeCompare(a.date));

  const EditRecordDialog = ({ record }: {record: DailyRecord}) => (
    <>
      <DialogHeader>
        <DialogTitle>Edit Record for {format(parseISO(record.date), 'MMM d, yyyy')}</DialogTitle>
      </DialogHeader>
      <RecordForm record={record} placeId={place.id} setModalOpen={(open) => !open && setEditingRecord(null)} />
    </>
  );

  const EditRecordDrawer = ({ record }: {record: DailyRecord}) => (
    <>
      <DrawerHeader>
        <DrawerTitle>Edit Record for {format(parseISO(record.date), 'MMM d, yyyy')}</DrawerTitle>
      </DrawerHeader>
      <div className="p-4">
        <RecordForm record={record} placeId={place.id} setModalOpen={(open) => !open && setEditingRecord(null)} />
      </div>
    </>
  );

  return (
    <div className="p-0 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Date</TableHead>
            <TableHead className="text-center">Workers</TableHead>
            <TableHead className="text-center">Labourers</TableHead>
            <TableHead>Other Costs</TableHead>
            <TableHead className="text-right">Total (Rs:)</TableHead>
            <TableHead className="text-right w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRecords.map((record) => {
            const workerCost = record.workers * (place?.workerRate || 0);
            const labourerCost = record.labourers * (place?.labourerRate || 0);
            const additionalCostsTotal = (record.additionalCosts || []).reduce((acc, cost) => acc + (cost.amount || 0), 0);
            const total = workerCost + labourerCost + additionalCostsTotal;

            return (
            <TableRow key={record.id}>
              <TableCell className="font-medium whitespace-nowrap">{format(parseISO(record.date), 'EEE, MMM d')}</TableCell>
              <TableCell className="text-center">{record.workers}</TableCell>
              <TableCell className="text-center">{record.labourers}</TableCell>
              <TableCell>
                  <div className="flex flex-wrap gap-1">
                      {(record.additionalCosts || []).length > 0 ? (
                        record.additionalCosts.map((cost, index) => (
                          <Badge key={index} variant="secondary" className="font-normal whitespace-nowrap">
                              {cost.description}: Rs: {cost.amount.toFixed(2)}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-xs">N/A</span>
                      )}
                  </div>
              </TableCell>
              <TableCell className="text-right font-semibold">{total.toFixed(2)}</TableCell>
              <TableCell className="text-right">
                {isMobile ? (
                    <Drawer open={editingRecord?.id === record.id} onOpenChange={(isOpen) => !isOpen && setEditingRecord(null)}>
                        <DrawerTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setEditingRecord(record)}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit Record</span>
                            </Button>
                        </DrawerTrigger>
                        <DrawerContent>
                            {editingRecord && <EditRecordDrawer record={editingRecord}/>}
                        </DrawerContent>
                    </Drawer>
                ) : (
                    <Dialog open={editingRecord?.id === record.id} onOpenChange={(isOpen) => !isOpen && setEditingRecord(null)}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setEditingRecord(record)}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit Record</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            {editingRecord && <EditRecordDialog record={editingRecord}/>}
                        </DialogContent>
                    </Dialog>
                )}
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                      {deletingRecordId === record.id ? <Loader2 className="animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      <span className="sr-only">Delete Record</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the record for {format(parseISO(record.date), 'MMM d, yyyy')}. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(record.id)} className="bg-destructive hover:bg-destructive/90">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          )})}
        </TableBody>
      </Table>
    </div>
  );
}