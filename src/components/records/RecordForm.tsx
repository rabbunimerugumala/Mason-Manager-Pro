'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useData } from '@/contexts/DataContext';
import type { DailyRecord } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';
import { Separator } from '../ui/separator';

const additionalCostSchema = z.object({
  description: z.string().min(1, 'Description is required.'),
  amount: z.coerce.number().min(0, 'Amount must be positive.'),
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
  const { addOrUpdateRecord } = useData();
  const { toast } = useToast();

  const allAdditionalCosts = [
      ...(record.muta > 0 ? [{description: 'Muta', amount: record.muta}] : []),
      ...(record.machines > 0 ? [{description: 'Machines', amount: record.machines}] : []),
      ...(record.additionalCosts || [])
  ]


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workers: record.workers,
      labourers: record.labourers,
      additionalCosts: allAdditionalCosts,
      notes: record.notes || '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "additionalCosts",
  });


  function onSubmit(values: z.infer<typeof formSchema>) {
    addOrUpdateRecord(placeId, { ...values, date: record.date, muta: 0, machines: 0 });
    toast({ title: 'Success', description: 'Record updated.' });
    setModalOpen(false);
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
                onClick={() => append({ description: "", amount: 0 })}
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
        <Button type="submit" className="w-full">
          Save Changes
        </Button>
      </form>
    </Form>
  );
}
