import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import nodemailer from "nodemailer";
import VerificationService from "../services/VerificationService";
import { TRPCError } from "@trpc/server";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const verificationRouter = createTRPCRouter({
  sendVerification: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        // Add other required fields
      })
    )
    .mutation(async ({ input }) => {
      try {
        await transporter.verify();
        // Add your verification logic here
        const result = await VerificationService.sendVerification(input.email);
        return { success: true, data: result };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send verification email",
        });
      }
    }),
});
