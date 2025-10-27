'use client';

import { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DailyRecord } from '@/lib/types';
import { useData } from '@/contexts/DataContext';
import { RecordForm } from './RecordForm';

interface HistoryTableProps {
  records: DailyRecord[];
  placeId: string;
}

export function HistoryTable({ records, placeId }: HistoryTableProps) {
  const { deleteRecord } = useData();
  const [editingRecord, setEditingRecord] = useState<DailyRecord | null>(null);

  if (records.length === 0) {
    return (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h2 className="text-xl font-semibold text-muted-foreground">No records found.</h2>
            <p className="text-muted-foreground mt-2">Manage daily attendance to see history here.</p>
        </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Date</TableHead>
              <TableHead className="text-center">Workers</TableHead>
              <TableHead className="text-center">Labourers</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">{format(parseISO(record.date), 'MMM d, yyyy')}</TableCell>
                <TableCell className="text-center">{record.workers}</TableCell>
                <TableCell className="text-center">{record.labourers}</TableCell>
                <TableCell className="max-w-[300px] truncate">{record.notes || 'N/A'}</TableCell>
                <TableCell className="text-right">
                  <Dialog open={editingRecord?.id === record.id} onOpenChange={(isOpen) => !isOpen && setEditingRecord(null)}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => setEditingRecord(record)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit Record</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Record for {format(parseISO(record.date), 'MMM d, yyyy')}</DialogTitle>
                      </DialogHeader>
                      {editingRecord && <RecordForm record={editingRecord} placeId={placeId} setModalOpen={(open) => !open && setEditingRecord(null)} />}
                    </DialogContent>
                  </Dialog>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
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
                        <AlertDialogAction onClick={() => deleteRecord(placeId, record.id)} className="bg-destructive hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
