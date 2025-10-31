'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { DailyRecord } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Separator } from '../ui/separator';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';


const additionalCostSchema = z.object({
  description: z.string().min(1, 'Description is required.'),
  amount: z.coerce.number().min(0, 'Amount must be positive.').optional().or(z.literal('')),
});

const formSchema = z.object({
  workers: z.coerce.number().min(0, { message: 'Count must be a positive number.' }),
  labourers: z.coerce.number().min(0, { message: 'Count must be a positive number.' }),
  additionalCosts: z.array(additionalCostSchema).optional(),
  notes: z.string().optional(),
});

interface RecordFormProps {
  record: DailyRecord;
  placeId: string;
  setModalOpen: (open: boolean) => void;
}

export function RecordForm({ record, placeId, setModalOpen }: RecordFormProps) {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workers: record.workers,
      labourers: record.labourers,
      additionalCosts: record.additionalCosts?.map(c => ({...c, amount: c.amount || ''})) || [],
      notes: record.notes || '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "additionalCosts",
  });


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return;
    try {
      const validCosts = values.additionalCosts?.filter(c => c.description && c.amount).map(c => ({...c, amount: Number(c.amount)})) || [];
      const recordRef = doc(firestore, 'users', user.uid, 'places', placeId, 'dailyRecords', record.id);
      updateDocumentNonBlocking(recordRef, { ...values, additionalCosts: validCosts, updatedAt: serverTimestamp() });
      toast({ title: 'Success', description: 'Record updated.' });
      setModalOpen(false);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message || "Could not update record." });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="workers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Workers</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="labourers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Labourers</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <h3 className="font-medium">Additional Costs</h3>
            {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-6">
                       <FormField
                        control={form.control}
                        name={`additionalCosts.${index}.description`}
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input placeholder="Cost description" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                    <div className="col-span-4">
                        <FormField
                        control={form.control}
                        name={`additionalCosts.${index}.amount`}
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input type="number" placeholder="Amount" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                    <div className='col-span-2'>
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4 text-destructive"/>
                        </Button>
                    </div>
                </div>
            ))}
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ description: "", amount: "" })}
                >
                <Plus className='mr-2 h-4 w-4' />
                Add Cost
            </Button>
        </div>


        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Add any notes for this day..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className={cn("w-full btn-gradient-primary")} disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Loader2 className="animate-spin mr-2" />}
          Save Changes
        </Button>
      </form>
    </Form>
  );
}
