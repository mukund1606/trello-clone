import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

import { CreateTaskSchema, StatusEnum, UpdateTaskSchema } from "@/types/forms";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const priorityOrder = ["Urgent", "Medium", "Low"];

export const taskRouter = createTRPCRouter({
  create: protectedProcedure
    .input(CreateTaskSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.db.task.create({
          data: {
            userId: ctx.user.id,
            title: input.title,
            description: input.description,
            status: input.status,
            priority: input.priority,
            deadline: input.deadline,
          },
        });
        return {
          message: "Task created successfully.",
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }
    }),
  update: protectedProcedure
    .input(UpdateTaskSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const task = await ctx.db.task.findUnique({
          where: {
            userId: ctx.user.id,
            id: input.id,
          },
        });
        if (!task) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Task not found",
          });
        }
        await ctx.db.task.update({
          where: {
            id: input.id,
          },
          data: {
            userId: ctx.user.id,
            title: input.title,
            description: input.description,
            status: input.status,
            priority: input.priority,
            deadline: input.deadline,
          },
        });
        return {
          message: "Task updated successfully.",
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }
    }),
  updateStatus: protectedProcedure
    .input(z.object({ id: z.string(), status: StatusEnum }))
    .mutation(async ({ input, ctx }) => {
      try {
        const task = await ctx.db.task.findUnique({
          where: {
            userId: ctx.user.id,
            id: input.id,
          },
        });
        if (!task) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Task not found",
          });
        }
        await ctx.db.task.update({
          where: {
            userId: ctx.user.id,
            id: input.id,
          },
          data: {
            status: input.status,
          },
        });
        return {
          message: "Task updated successfully.",
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const task = await ctx.db.task.findUnique({
          where: {
            userId: ctx.user.id,
            id: input.id,
          },
        });
        if (!task) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Task not found",
          });
        }
        await ctx.db.task.delete({
          where: {
            userId: ctx.user.id,
            id: input.id,
          },
        });
        return {
          message: "Task deleted successfully.",
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }
    }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    try {
      const tasks = await ctx.db.task.findMany({
        where: {
          userId: ctx.user.id,
        },
      });
      return tasks.sort(
        (a, b) =>
          priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority),
      );
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong",
      });
    }
  }),
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const task = await ctx.db.task.findUnique({
          where: {
            userId: ctx.user.id,
            id: input.id,
          },
        });
        if (!task) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Task not found",
          });
        }
        return task;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }
    }),
});
