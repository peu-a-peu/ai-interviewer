import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { eq } from "drizzle-orm";
import { verificationTokens } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";

export const authRouter = createTRPCRouter({
  checkLoginStatus: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .query(async ({ input, ctx }) => {
      const user = await ctx.db
        .select()
        .from(verificationTokens)
        .where(eq(verificationTokens.email, input.email))
        .limit(1)
        .then((rows) => rows[0]);

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return {
        email: user.email,
      };
    }),
});
