import { cookies } from "next/headers";

import { hash, verify } from "@node-rs/argon2";

import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { lucia } from "@/server/auth";

import { SignInSchema, SignUpSchema } from "@/types/forms";
import { TRPCError } from "@trpc/server";

export const authRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  signUp: publicProcedure
    .input(SignUpSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const passwordHash = await hash(input.password, {
          memoryCost: 19456,
          timeCost: 2,
          outputLen: 32,
          parallelism: 1,
        });
        const userExists = await ctx.db.user.findUnique({
          where: {
            email: input.email,
          },
        });
        if (userExists) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Email already exists",
          });
        }
        const user = await ctx.db.user.create({
          data: {
            name: input.name,
            email: input.email,
            hashedPassword: passwordHash,
          },
        });
        const session = await lucia.createSession(user.id, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
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
  signIn: publicProcedure
    .input(SignInSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const user = await ctx.db.user.findUnique({
          where: {
            email: input.email,
          },
        });
        if (!user) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Incorrect email or password",
          });
        }
        const validPassword = await verify(
          user.hashedPassword,
          input.password,
          {
            memoryCost: 19456,
            timeCost: 2,
            outputLen: 32,
            parallelism: 1,
          },
        );
        if (!validPassword) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Incorrect email or password",
          });
        }
        const session = await lucia.createSession(user.id, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
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
  logOut: protectedProcedure.mutation(async ({ ctx }) => {
    await lucia.invalidateSession(ctx.session.id);
    const sessionCookie = lucia.createBlankSessionCookie();
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
  }),
});
