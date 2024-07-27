import { z } from "zod";

export const SignUpSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Email is invalid.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

export const SignInSchema = z.object({
  email: z.string().email({
    message: "Email is invalid.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

export const StatusEnum = z.enum(
  ["To_Do", "In_Progress", "Under_Review", "Completed"],
  {
    message: "Invalid status.",
  },
);
export const PriorityEnum = z.enum(["Low", "Medium", "Urgent"], {
  message: "Invalid priority.",
});

export const CreateTaskSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().optional(),
  status: StatusEnum,
  priority: PriorityEnum,
  deadline: z.coerce
    .date({
      message: "Invalid date.",
    })
    .optional(),
});

export const UpdateTaskSchema = CreateTaskSchema.extend({
  id: z.string().min(1, {
    message: "ID must be at least 1 characters.",
  }),
});
