import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { eq, desc } from "drizzle-orm";
import { users, ticketTransactions } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import TicketTransactionService from "../services/TicketTransactionService";

export const ticketRouter = createTRPCRouter({
  getTransactions: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .query(async ({ input, ctx }) => {
      const user = await ctx.db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1)
        .then((rows) => rows[0]);

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const transactions = await ctx.db
        .select()
        .from(ticketTransactions)
        .where(eq(ticketTransactions.userId, user.id))
        .orderBy(desc(ticketTransactions.createdAt));

      return { transactions };
    }),

  getTransactionData: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .query(async ({ input, ctx }) => {
      const user = await ctx.db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1)
        .then((rows) => rows[0]);

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const transactions = await ctx.db
        .select()
        .from(ticketTransactions)
        .where(eq(ticketTransactions.userId, user.id))
        .orderBy(desc(ticketTransactions.createdAt));

      return {
        user,
        transactions,
      };
    }),

  useTicket: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1)
        .then((rows) => rows[0]);

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      if (user.ticketCount < 1) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No tickets available",
        });
      }

      const result = await ctx.db
        .update(users)
        .set({
          ticketCount: user.ticketCount - 1,
          updatedAt: new Date(),
        })
        .where(eq(users.email, input.email))
        .returning({ updatedTicketCount: users.ticketCount });

      await TicketTransactionService.recordTransaction(
        input.email,
        -1,
        "CONSUMPTION",
        "Used 1 interview ticket"
      );

      return {
        success: true,
        data: result[0],
      };
    }),
});
