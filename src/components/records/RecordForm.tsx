'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useData } from '@/contexts/DataContext';
import type { DailyRecord } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  workers: z.coerce.number().min(0, { message: 'Count must be a positive number.' }),
  labourers: z.coerce.number().min(0, { message: 'Count must be a positive number.' }),
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workers: record.workers,
      labourers: record.labourers,
      notes: record.notes || '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const result = addOrUpdateRecord(placeId, { ...values, date: record.date });
    if(result.success) {
      toast({ title: 'Success', description: 'Record updated.' });
    }
    setModalOpen(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
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
