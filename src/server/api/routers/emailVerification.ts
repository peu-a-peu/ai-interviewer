import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import nodemailer from "nodemailer";
import crypto from "crypto";
import VerificationService from "@/server/api/services/VerificationService";
import { TRPCError } from "@trpc/server";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  debug: true,
});

transporter.verify(function (error, success) {
  if (error) {
    console.error("Transporter verification failed:", error);
    console.log("email and pass: ", {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    });
  } else {
    console.log("Server is ready to take our messages");
  }
});

export const emailVerificationRouter = createTRPCRouter({
  sendVerification: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const token = crypto.randomBytes(32).toString("hex");
      const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

      // Save token to database
      await VerificationService.createVerificationToken(input.email, token);

      // Email content
      const mailOptions = {
        from: process.env.EMAIL_USER,
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

export async function testEmailService() {
  try {
    await transporter.verify();
    return { status: "ok", message: "Email service is working" };
  } catch (error) {
    console.error("Email service error:", error);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return { status: "error", message: error };
  }
}

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.error("Email credentials not properly configured");
  throw new Error("Email configuration missing");
}
