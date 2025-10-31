'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useData } from '@/contexts/DataContext';
import type { Place } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  workerRate: z.coerce.number().min(0, { message: 'Rate must be a positive number.' }).optional().or(z.literal('')),
  labourerRate: z.coerce.number().min(0, { message: 'Rate must be a positive number.' }).optional().or(z.literal('')),
});

interface PlaceFormProps {
  place?: Place;
  setModalOpen: (open: boolean) => void;
}

export function PlaceForm({ place, setModalOpen }: PlaceFormProps) {
  const { addPlace, updatePlace } = useData();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: place?.name || '',
      workerRate: place?.workerRate || '',
      labourerRate: place?.labourerRate || '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const data = {
        ...values,
        workerRate: Number(values.workerRate) || 0,
        labourerRate: Number(values.labourerRate) || 0,
    }
    try {
      if (place) {
        await updatePlace({ ...place, ...data });
        toast({ title: 'Success', description: 'Work site updated.' });
      } else {
        await addPlace(data);
        toast({ title: 'Success', description: 'New work site created.' });
      }
      setModalOpen(false);
      form.reset();
    } catch(error: any) {
       toast({ variant: 'destructive', title: 'Error', description: error.message || "Could not save the site." });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Downtown Skyscraper" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="workerRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Worker Rate (Rs:/day)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 1000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="labourerRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Labourer Rate (Rs:/day)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 600" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className={cn('w-full', 'btn-gradient-primary')} disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Loader2 className="animate-spin mr-2"/>}
          {place ? 'Save Changes' : 'Create Site'}
        </Button>
      </form>
    </Form>
  );
}
