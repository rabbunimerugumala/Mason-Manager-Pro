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

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  workerRate: z.coerce.number().min(0, { message: 'Rate must be a positive number.' }).default(0),
  labourerRate: z.coerce.number().min(0, { message: 'Rate must be a positive number.' }).default(0),
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
      workerRate: place?.workerRate || 0,
      labourerRate: place?.labourerRate || 0,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (place) {
      updatePlace({ ...place, ...values });
      toast({ title: 'Success', description: 'Work site updated.' });
    } else {
      addPlace(values);
      toast({ title: 'Success', description: 'New work site created.' });
    }
    setModalOpen(false);
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
                <Input type="number" placeholder="1000" {...field} />
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
                <Input type="number" placeholder="600" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
          {place ? 'Save Changes' : 'Create Place'}
        </Button>
      </form>
    </Form>
  );
}
