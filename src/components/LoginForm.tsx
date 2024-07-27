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
import { SignInSchema } from "@/types/forms";
import { useState } from "react";
import { toast } from "sonner";

import { api } from "@/trpc/react";
import { TRPCClientError } from "@trpc/client";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import Loader from "./loader";

export function LoginForm() {
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const form = useForm<z.infer<typeof SignInSchema>>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginRoute = api.auth.signIn.useMutation();

  async function onSubmit(data: z.infer<typeof SignInSchema>) {
    try {
      await loginRoute.mutateAsync({
        email: data.email,
        password: data.password,
      });
      toast.success("Login Successful!");
      router.push("/");
    } catch (error) {
      if (error instanceof TRPCClientError) {
        toast.error(error.message);
      }
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={isPasswordVisible ? "text" : "password"}
                    placeholder="********"
                    {...field}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    tabIndex={-1}
                    className="absolute right-0 top-0"
                    type="button"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  >
                    {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={loginRoute.isPending}
          className="flex gap-2"
        >
          {loginRoute.isPending && <Loader />}
          Login
        </Button>
      </form>
    </Form>
  );
}
