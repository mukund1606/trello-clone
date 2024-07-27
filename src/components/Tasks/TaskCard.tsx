import { cn } from "@/lib/utils";
import type { AppRouterOutputTypes } from "@/server/api/root";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React, { useState } from "react";
import { Badge } from "../ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { TaskForm } from "./TaskForm";

import { api } from "@/trpc/react";
import { TRPCClientError } from "@trpc/client";
import dayjs from "dayjs";
import { ClockIcon, PencilIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";
import Loader from "../loader";
import { Button } from "../ui/button";

export default function TaskCard({
  data,
}: {
  data: AppRouterOutputTypes["task"]["getAll"][0];
}) {
  const apiUtils = api.useUtils();
  const deleteRoute = api.task.delete.useMutation({
    async onSuccess() {
      await apiUtils.task.getAll.invalidate();
    },
  });

  const [isOpen, setIsOpen] = useState(false);
  const { setNodeRef, attributes, listeners, transform, transition } =
    useSortable({
      id: data.id,
      data: {
        type: "task",
        data,
      },
    });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const createdDiffDays = dayjs().diff(dayjs(data.createdAt), "day");
  const createdDiffHours =
    dayjs().diff(dayjs(data.createdAt), "hour") > 24
      ? dayjs().diff(dayjs(data.createdAt), "hour") -
        dayjs().diff(dayjs(data.createdAt), "day") * 24
      : dayjs().diff(dayjs(data.createdAt), "hour");
  const createdDiffMins =
    dayjs().diff(dayjs(data.createdAt), "minute") > 60
      ? dayjs().diff(dayjs(data.createdAt), "minute") -
        dayjs().diff(dayjs(data.createdAt), "hour") * 60
      : dayjs().diff(dayjs(data.createdAt), "minute");

  async function handleDelete() {
    try {
      const res = await deleteRoute.mutateAsync({
        id: data.id,
      });
      toast.success(res.message);
    } catch (err) {
      if (err instanceof TRPCClientError) {
        toast.error(err.message);
      }
    }
  }

  return (
    <>
      <Dialog modal open={isOpen} onOpenChange={setIsOpen}>
        <Card
          ref={setNodeRef}
          style={style}
          {...attributes}
          {...listeners}
          onClick={() => console.log("clicked")}
        >
          <CardHeader className="p-3">
            <CardTitle className="flex items-center justify-between text-base font-semibold">
              <span>{data.title}</span>
              <div className="flex items-center gap-2">
                <DialogTrigger asChild>
                  <Button size="icon" className="h-fit w-fit p-2">
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <Button
                  onClick={handleDelete}
                  size="icon"
                  variant="destructive"
                  className="h-fit w-fit p-2"
                >
                  {deleteRoute.isPending ? (
                    <Loader size={16} />
                  ) : (
                    <TrashIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardTitle>
            <CardDescription className="flex flex-col text-sm text-muted-foreground">
              {data.description?.split("\n").map((line) => (
                <span className="leading-tight" key={line}>
                  {line}
                </span>
              ))}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-start gap-2 p-3">
            <Badge
              variant="outline"
              className={cn(
                data.priority === "Low" && "bg-green-600 text-white",
                data.priority === "Medium" && "bg-yellow-600 text-white",
                data.priority === "Urgent" && "bg-red-600 text-white",
              )}
            >
              {data.priority}
            </Badge>
            {data.deadline ? (
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <ClockIcon className="h-4 w-4" />
                {dayjs(data.deadline).format("YYYY-MM-DD")}
              </p>
            ) : null}
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              {/* Show how long ago the task was created in hours */}
              {createdDiffDays > 0 ? `${createdDiffDays} days ` : null}
              {createdDiffHours > 0 ? `${createdDiffHours} hours ` : null}
              {createdDiffMins > 0 ? `${createdDiffMins} minutes ` : null}
              {createdDiffDays > 0 ||
              createdDiffMins > 0 ||
              createdDiffHours > 0
                ? "ago"
                : ""}
            </p>
          </CardContent>
        </Card>
        <DialogContent className="max-w-[clamp(200px,70vw,850px)]">
          <DialogHeader>
            <DialogTitle>Update Task</DialogTitle>
          </DialogHeader>
          <TaskForm
            closeDialog={() => setIsOpen(false)}
            isCreateForm={false}
            initialValues={{
              id: data.id,
              title: data.title,
              priority: data.priority,
              status: data.status,
              deadline: data.deadline ?? undefined,
              description: data.description ?? undefined,
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
