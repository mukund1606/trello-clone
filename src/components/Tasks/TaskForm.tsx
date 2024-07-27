"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CreateTaskSchema, type UpdateTaskSchema } from "@/types/forms";
import { toast } from "sonner";

import Loader from "@/components/loader";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { TRPCClientError } from "@trpc/client";
import { format } from "date-fns";
import {
  CalendarIcon,
  LoaderIcon,
  PencilIcon,
  TriangleAlertIcon,
} from "lucide-react";

export function TaskForm({
  closeDialog,
  initialValues,
  isCreateForm = true,
}: {
  closeDialog?: () => void;
  initialValues?: z.infer<typeof UpdateTaskSchema>;
  isCreateForm?: boolean;
}) {
  const form = useForm<z.infer<typeof CreateTaskSchema>>({
    resolver: zodResolver(CreateTaskSchema),
    defaultValues: initialValues,
  });
  const apiUtils = api.useUtils();
  const createRoute = api.task.create.useMutation({
    async onSuccess() {
      await apiUtils.task.invalidate();
    },
  });
  const updateRoute = api.task.update.useMutation({
    async onSuccess() {
      await apiUtils.task.invalidate();
    },
  });

  async function onSubmit(data: z.infer<typeof CreateTaskSchema>) {
    try {
      if (isCreateForm) {
        const res = await createRoute.mutateAsync(data);
        toast.success(res.message);
      } else {
        if (!initialValues?.id) return;
        await updateRoute.mutateAsync({
          id: initialValues.id,
          ...data,
        });
      }
    } catch (error) {
      if (error instanceof TRPCClientError) {
        toast.error(error.message);
      }
    }
    if (closeDialog) closeDialog();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Title"
                  {...field}
                  className="h-fit w-full border-none text-2xl font-medium outline-none placeholder:opacity-50 focus-visible:ring-0 focus-visible:ring-offset-0 sm:text-3xl"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <div className="grid grid-cols-2 items-center gap-4 sm:grid-cols-3">
                <FormLabel className="flex items-center gap-2 opacity-50">
                  <LoaderIcon className="h-5 w-5" />{" "}
                  <span className="text-base">Status</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl className="col-span-1 sm:col-span-2">
                    <SelectTrigger
                      className={cn(
                        "border-none text-base outline-none focus:ring-0 focus:ring-offset-0",
                        !field.value && "opacity-50",
                      )}
                    >
                      <SelectValue placeholder="Not Selected" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem className="text-base" value="To_Do">
                      To Do
                    </SelectItem>
                    <SelectItem className="text-base" value="In_Progress">
                      In Progress
                    </SelectItem>
                    <SelectItem className="text-base" value="Under_Review">
                      Under Review
                    </SelectItem>
                    <SelectItem className="text-base" value="Completed">
                      Completed
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <div className="grid grid-cols-2 items-center gap-4 sm:grid-cols-3">
                <FormLabel className="flex items-center gap-2 opacity-50">
                  <TriangleAlertIcon className="h-5 w-5" />{" "}
                  <span className="text-base">Priority</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl className="col-span-1 sm:col-span-2">
                    <SelectTrigger
                      className={cn(
                        "border-none text-base outline-none focus:ring-0 focus:ring-offset-0",
                        !field.value && "opacity-50",
                      )}
                    >
                      <SelectValue placeholder="Not Selected" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem className="text-base" value="Urgent">
                      Urgent
                    </SelectItem>
                    <SelectItem className="text-base" value="Medium">
                      Medium
                    </SelectItem>
                    <SelectItem className="text-base" value="Low">
                      Low
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="deadline"
          render={({ field }) => (
            <FormItem>
              <div className="grid grid-cols-2 items-center gap-4 sm:grid-cols-3">
                <FormLabel className="flex items-center gap-2 opacity-50">
                  <CalendarIcon className="h-5 w-5" />{" "}
                  <span className="text-base">Deadline</span>
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl className="col-span-1 w-full sm:col-span-2">
                      <Input
                        value={
                          field.value
                            ? format(field.value, "yyyy-MM-dd")
                            : "Deadline"
                        }
                        className={cn(
                          "w-full border-none text-left text-base outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
                          !field.value && "opacity-50",
                        )}
                      />
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      className="min-h-10 border-none text-base outline-none placeholder:text-black focus-visible:ring-0 focus-visible:ring-offset-0"
                      fixedWeeks
                      selected={field.value}
                      onSelect={field.onChange}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <div className="grid grid-cols-2 items-center gap-4 sm:grid-cols-3">
                <FormLabel className="flex items-center gap-2 opacity-50">
                  <PencilIcon className="h-5 w-5" />{" "}
                  <span className="text-base">Description</span>
                </FormLabel>
                <FormControl className="col-span-1 sm:col-span-2">
                  <Textarea
                    rows={field.value?.split("\n").length ?? 1}
                    placeholder="Description"
                    {...field}
                    className={cn(
                      "min-h-10 border-none text-base outline-none placeholder:text-black focus-visible:ring-0 focus-visible:ring-offset-0",
                      !field.value && "opacity-50",
                    )}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="flex gap-2"
          disabled={createRoute.isPending || updateRoute.isPending}
        >
          {(createRoute.isPending || updateRoute.isPending) && <Loader />}
          {isCreateForm ? "Create" : "Update"}
        </Button>
      </form>
    </Form>
  );
}
