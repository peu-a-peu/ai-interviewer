import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import nodemailer from "nodemailer";
import crypto from "crypto";
import VerificationService from "@/server/api/services/VerificationService";
import { TRPCError } from "@trpc/server";
import { env } from "@/env";

export const emailVerificationRouter = createTRPCRouter({
  sendVerification: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        redirectUrl: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,         // TLS port
        secure: false,
        auth: {
          user: env.EMAIL_USER,
          pass: env.EMAIL_PASSWORD,
        },
        debug: true,
      });
      const token = crypto.randomBytes(32).toString("hex");
      const verificationLink = `${input.redirectUrl}/verify-email?token=${token}`;

      // Save token to database
      await VerificationService.createVerificationToken(input.email, token);

      // Email content
      const mailOptions = {
        from: env.EMAIL_USER,
        to: input.email,
        subject: "Email Verification",
        html: `
          <h1>Verify Your Email</h1>
          <p>Please click the link below to verify your email address:</p>
          <a href="${verificationLink}">${verificationLink}</a>
          <p>This link will expire in 24 hours.</p>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        return { success: true };
      } catch (error) {
        console.log(error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send verification email",
        });
      }
    }),

  verifyEmail: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const email = await VerificationService.verifyToken(input.token);

        // Return the verified email and success status
        return {
          success: true,
          message: "Email verified successfully",
          session: {
            user: {
              email,
              emailVerified: true,
            },
            expires: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            ).toISOString(), // 30 days
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            error instanceof Error ? error.message : "Verification failed",
        });
      }
    }),
});
