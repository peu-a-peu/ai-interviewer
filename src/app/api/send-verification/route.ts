import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import crypto from "crypto";
import VerificationService from "@/server/api/services/VerificationService";
import CustomError from "@/app/components/utils/CustomError";

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify transporter configuration
try {
  await transporter.verify();
} catch (error) {
  console.error("Email configuration error:", error);
  throw new Error("Email service not properly configured");
}

export async function POST(req: Request) {
  try {
    // Validate request body
    const body = await req.json();
    if (!body.email || !body.email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const { email } = body;

    // Generate verification token
    const token = crypto.randomBytes(32).toString("hex");
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

    try {
      // Save token to database
      await VerificationService.createVerificationToken(email, token);
    } catch (dbError) {
      console.error("Database error:", dbError);
      throw new CustomError("Failed to store verification token", 500);
    }

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Email Verification",
      html: `
        <h1>Verify Your Email</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationLink}">${verificationLink}</a>
        <p>This link will expire in 24 hours.</p>
      `,
    };

    try {
      // Send email
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      throw new CustomError("Failed to send verification email", 500);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verification email error:", error);

    if (error instanceof CustomError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
