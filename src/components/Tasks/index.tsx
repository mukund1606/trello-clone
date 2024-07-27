"use client";

import { useEffect, useMemo, useState } from "react";

import type { AppRouterOutputTypes } from "@/server/api/root";
import { api } from "@/trpc/react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import type { Status } from "@prisma/client";
import { TaskContainer } from "./TaskContainer";

const initialStatuses = [
  {
    id: "To_Do",
    name: "To Do",
  },
  {
    id: "In_Progress",
    name: "In Progress",
  },
  {
    id: "Under_Review",
    name: "Under Review",
  },
  {
    id: "Completed",
    name: "Completed",
  },
];

export default function Tasks() {
  const { data: tasksData } = api.task.getAll.useQuery();

  const [tasks, setTasks] = useState<AppRouterOutputTypes["task"]["getAll"]>();

  const [statuses, setStatuses] = useState(initialStatuses);
  const statusIds = useMemo(
    () => statuses.map((status) => status.id),
    [statuses],
  );

  const updateStatusRoute = api.task.updateStatus.useMutation({
    async onSuccess() {
      await api.useUtils().task.getAll.invalidate();
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const activeStatusId = active.id;
    const overStatusId = over.id;
    if (activeStatusId === overStatusId) {
      return;
    }

    setStatuses((statuses) => {
      const activeColumnIndex = statuses.findIndex(
        (status) => status.id === activeStatusId,
      );
      const overColumnIndex = statuses.findIndex(
        (status) => status.id === overStatusId,
      );
      return arrayMove(statuses, activeColumnIndex, overColumnIndex);
    });
  }

  async function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const activeStatusId = active.id;
    const overStatusId = over.id;
    if (activeStatusId === overStatusId) {
      return;
    }

    const isActiveATask = active.data.current?.type === "task";
    const isOverATask = over.data.current?.type === "task";

    if (isActiveATask && isOverATask) {
      if (!tasks) return;
      const activeTaskIndex = tasks.findIndex(
        (task) => task.id === activeStatusId,
      );
      const overTaskIndex = tasks.findIndex((task) => task.id === overStatusId);
      if (tasks[activeTaskIndex]!.status !== tasks[overTaskIndex]!.status) {
        updateStatusRoute.mutate({
          id: tasks[activeTaskIndex]!.id,
          status: tasks[overTaskIndex]!.status,
        });
      }
      setTasks((tasks) => {
        if (!tasks) return tasks;
        tasks[activeTaskIndex]!.status = tasks[overTaskIndex]!.status;
        return arrayMove(tasks, activeTaskIndex, overTaskIndex);
      });
    } else if (isActiveATask) {
      if (!tasks) return tasks;
      const activeTaskIndex = tasks.findIndex(
        (task) => task.id === activeStatusId,
      );
      updateStatusRoute.mutate({
        id: tasks[activeTaskIndex]!.id,
        status: overStatusId as Status,
      });
      setTasks((tasks) => {
        if (!tasks) return;
        tasks[activeTaskIndex]!.status = overStatusId as Status;
        return arrayMove(tasks, activeTaskIndex, 0);
      });
    }
  }
  useEffect(() => {
    setTasks(tasksData);
  }, [tasksData]);

  return (
    <>
      <DndContext
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
        sensors={sensors}
      >
        <div className="grid w-full gap-1 sm:grid-cols-2 lg:grid-cols-4">
          <SortableContext items={statusIds}>
            {statuses.map((status) => {
              return (
                <TaskContainer
                  key={status.id}
                  status={status}
                  tasks={
                    tasks?.filter(
                      (task) => task.status === (status.id as Status),
                    ) ?? []
                  }
                />
              );
            })}
          </SortableContext>
        </div>
      </DndContext>
    </>
  );
}
