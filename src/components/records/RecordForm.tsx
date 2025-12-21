// ✅ Generated following IndiBuddy project rules

"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import type { DailyRecord, AdditionalCost } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useFirestoreContext } from "@/context/FirebaseProvider";
import {
  doc,
  collection,
  serverTimestamp,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import { format } from "date-fns";

const formSchema = z.object({
  workers: z.coerce.number().min(0, { message: "Workers must be 0 or more." }),
  labourers: z.coerce
    .number()
    .min(0, { message: "Labourers must be 0 or more." }),
  additionalCosts: z.array(
    z.object({
      description: z.string(),
      amount: z.coerce.number().min(0),
    })
  ),
  notes: z.string().optional(),
});

interface RecordFormProps {
  record?: DailyRecord;
  placeId: string;
  setModalOpen: (open: boolean) => void;
  selectedDate?: Date;
}

export function RecordForm({
  record,
  placeId,
  setModalOpen,
  selectedDate,
}: RecordFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const firestore = useFirestoreContext();

  const recordDate = selectedDate
    ? format(selectedDate, "yyyy-MM-dd")
    : record?.date || format(new Date(), "yyyy-MM-dd");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workers: record?.workers || 0,
      labourers: record?.labourers || 0,
      additionalCosts:
        record?.additionalCosts && record.additionalCosts.length > 0
          ? record.additionalCosts.map((c) => ({
              description: c.description,
              amount: c.amount,
            }))
          : [{ description: "", amount: 0 }],
      notes: record?.notes || "",
    },
  });

  const [additionalCosts, setAdditionalCosts] = useState<
    Array<{ description: string; amount: number }>
  >(form.getValues("additionalCosts"));

  useEffect(() => {
    const currentCosts = form.getValues("additionalCosts");
    setAdditionalCosts(currentCosts);
  }, [form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to save a record.",
      });
      return;
    }

    const validAdditionalCosts = values.additionalCosts.filter(
      (c) => c.description && c.amount > 0
    );
    const data = {
      date: recordDate,
      workers: values.workers,
      labourers: values.labourers,
      additionalCosts: validAdditionalCosts,
      notes: values.notes || undefined,
      updatedAt: serverTimestamp(),
    };

    if (record) {
      const recordRef = doc(
        firestore,
        "users",
        user.id,
        "sites",
        placeId,
        "dailyRecords",
        record.id
      );
      updateDoc(recordRef, data)
        .then(() => {
          toast({ title: "Success", description: "Record updated." });
        })
        .catch((error: unknown) => {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to update record.";
          toast({
            variant: "destructive",
            title: "Error",
            description: errorMessage,
          });
        });
    } else {
      const recordsCollection = collection(
        firestore,
        "users",
        user.id,
        "sites",
        placeId,
        "dailyRecords"
      );
      addDoc(recordsCollection, { ...data, createdAt: serverTimestamp() })
        .then(() => {
          toast({ title: "Success", description: "Record created." });
        })
        .catch((error: unknown) => {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to create record.";
          toast({
            variant: "destructive",
            title: "Error",
            description: errorMessage,
          });
        });
    }
    setModalOpen(false);
    form.reset();
  }

  const addCostField = () => {
    const newCosts = [...additionalCosts, { description: "", amount: 0 }];
    setAdditionalCosts(newCosts);
    form.setValue("additionalCosts", newCosts);
  };

  const removeCostField = (index: number) => {
    if (additionalCosts.length === 1) {
      const newCosts = [{ description: "", amount: 0 }];
      setAdditionalCosts(newCosts);
      form.setValue("additionalCosts", newCosts);
      return;
    }
    const newCosts = additionalCosts.filter((_, i) => i !== index);
    setAdditionalCosts(newCosts);
    form.setValue("additionalCosts", newCosts);
  };

  const updateCostField = (
    index: number,
    field: "description" | "amount",
    value: string | number
  ) => {
    const newCosts = [...additionalCosts];
    newCosts[index] = {
      ...newCosts[index],
      [field]: field === "amount" ? Number(value) || 0 : String(value),
    };
    setAdditionalCosts(newCosts);
    form.setValue("additionalCosts", newCosts);
  };

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
                  <Input type="number" placeholder="0" {...field} />
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
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label>Additional Costs</Label>
          {additionalCosts.map((cost, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-6 space-y-1">
                <Input
                  placeholder="Description"
                  value={cost.description}
                  onChange={(e) =>
                    updateCostField(index, "description", e.target.value)
                  }
                />
              </div>
              <div className="col-span-4 space-y-1">
                <Input
                  type="number"
                  placeholder="Amount"
                  value={cost.amount || ""}
                  onChange={(e) =>
                    updateCostField(index, "amount", e.target.value)
                  }
                />
              </div>
              <div className="col-span-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCostField(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addCostField}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Cost
          </Button>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any additional notes..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className={cn("w-full", "btn-gradient-primary")}
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting && (
            <Loader2 className="animate-spin mr-2" />
          )}
          {record ? "Update Record" : "Create Record"}
        </Button>
      </form>
    </Form>
  );
}
