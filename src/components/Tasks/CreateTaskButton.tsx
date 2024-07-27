"use client";

import { PlusCircleIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { TaskForm } from "./TaskForm";

export default function CreateTaskButton() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog modal open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center justify-center gap-2">
          Add New <PlusCircleIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[clamp(200px,70vw,850px)]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        <TaskForm closeDialog={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
