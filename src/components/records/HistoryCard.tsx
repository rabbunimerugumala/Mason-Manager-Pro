'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { DailyRecord, Place } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Users, HardHat, DollarSign, StickyNote, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { RecordForm } from './RecordForm';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUser, useFirestore, deleteDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';


interface HistoryCardProps {
    record: DailyRecord;
    place: Place;
}

export function HistoryCard({ record, place }: HistoryCardProps) {
    const { toast } = useToast();
    const { user } = useUser();
    const firestore = useFirestore();
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const isMobile = useIsMobile();

    const workerCost = record.workers * (place.workerRate || 0);
    const labourerCost = record.labourers * (place.labourerRate || 0);
    const additionalCostsTotal = (record.additionalCosts || []).reduce((acc, cost) => acc + (cost.amount || 0), 0);
    const total = workerCost + labourerCost + additionalCostsTotal;

    const handleDelete = () => {
        if (!user) return;
        setIsDeleting(true);
        const recordRef = doc(firestore, 'users', user.uid, 'places', place.id, 'dailyRecords', record.id);
        deleteDocumentNonBlocking(recordRef);
        toast({ title: 'Success', description: 'Record deleted.' });
        setIsDeleting(false);
    };

    const EditRecordDialog = () => (
        <>
            <DialogHeader>
                <DialogTitle>Edit Record for {format(parseISO(record.date), 'MMM d, yyyy')}</DialogTitle>
            </DialogHeader>
            <RecordForm record={record} placeId={place.id} setModalOpen={setEditModalOpen} />
        </>
    );

    const EditRecordDrawer = () => (
        <>
            <DrawerHeader>
                <DrawerTitle>Edit Record for {format(parseISO(record.date), 'MMM d, yyyy')}</DrawerTitle>
            </DrawerHeader>
            <div className="p-4">
                <RecordForm record={record} placeId={place.id} setModalOpen={setEditModalOpen} />
            </div>
        </>
    );

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">{format(parseISO(record.date), 'EEEE, MMM d')}</CardTitle>
                        <p className="text-sm font-bold text-primary">Total: Rs: {total.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                        {isMobile ? (
                             <Drawer open={isEditModalOpen} onOpenChange={setEditModalOpen}>
                                <DrawerTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </DrawerTrigger>
                                <DrawerContent>
                                    <EditRecordDrawer />
                                </DrawerContent>
                            </Drawer>
                        ) : (
                            <Dialog open={isEditModalOpen} onOpenChange={setEditModalOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <EditRecordDialog />
                                </DialogContent>
                            </Dialog>
                        )}
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete the record for {format(parseISO(record.date), 'MMM d, yyyy')}.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                                    {isDeleting && <Loader2 className="animate-spin mr-2" />}
                                    Delete
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                    <span className="flex items-center text-muted-foreground"><HardHat className="mr-2 h-4 w-4" /> Workers</span>
                    <span className="font-medium">{record.workers}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="flex items-center text-muted-foreground"><Users className="mr-2 h-4 w-4" /> Labourers</span>
                    <span className="font-medium">{record.labourers}</span>
                </div>
                
                {(record.additionalCosts || []).length > 0 && (
                    <>
                        <Separator />
                        <div className="space-y-2">
                             <h4 className="flex items-center text-muted-foreground"><DollarSign className="mr-2 h-4 w-4" /> Additional Costs</h4>
                             <div className="pl-6 space-y-1">
                                {record.additionalCosts.map((cost, index) => (
                                    <div key={index} className="flex justify-between">
                                        <span className="text-muted-foreground">{cost.description}</span>
                                        <span className="font-medium">Rs: {cost.amount.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
                
                {record.notes && (
                    <>
                        <Separator />
                        <div className="space-y-2">
                             <h4 className="flex items-center text-muted-foreground"><StickyNote className="mr-2 h-4 w-4" /> Notes</h4>
                             <p className="pl-6 text-muted-foreground">{record.notes}</p>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}