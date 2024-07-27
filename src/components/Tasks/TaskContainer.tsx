import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type { AppRouterOutputTypes } from "@/server/api/root";
import type { Status } from "@prisma/client";
import { GripVertical, PlusCircleIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import TaskCard from "./TaskCard";
import { TaskForm } from "./TaskForm";

type TaskContainerProps = {
  status: {
    id: string;
    name: string;
  };
  tasks: AppRouterOutputTypes["task"]["getAll"];
};

export function TaskContainer({ status, tasks }: TaskContainerProps) {
  const tasksIds = useMemo(() => tasks.map((task) => task.id), [tasks]);

  const [isOpen, setIsOpen] = useState(false);
  const { setNodeRef, attributes, listeners, transform, transition } =
    useSortable({
      id: status.id,
      data: {
        type: "column",
        status,
      },
    });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  return (
    <div
      className="flex flex-col gap-2 rounded-md bg-background p-1"
      style={style}
      ref={setNodeRef}
    >
      <div className="flex items-center justify-between rounded-md border p-2">
        <h1 className="text-base font-medium">{status.name}</h1>
        <Button size="icon" variant="link" {...attributes} {...listeners}>
          <GripVertical />
        </Button>
      </div>
      <div className="grid gap-2">
        <SortableContext items={tasksIds}>
          {tasks.map((task) => {
            return <TaskCard key={task.id} data={task} />;
          })}
        </SortableContext>
      </div>
      <div>
        <Dialog modal open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="flex w-full items-center justify-center gap-2">
              Add New <PlusCircleIcon />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[clamp(200px,70vw,850px)]">
            <DialogHeader>
              <DialogTitle>Add New {status.name} Task</DialogTitle>
            </DialogHeader>
            <TaskForm
              closeDialog={() => setIsOpen(false)}
              initialValues={{
                id: "",
                title: "",
                priority: "Low",
                status: status.id as Status,
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
