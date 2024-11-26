import { NextRequest, NextResponse } from "next/server";
import VerificationService from "@/server/api/services/VerificationService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const email = await VerificationService.verifyToken(token);

    // Create a custom session
    const session = {
      user: {
        email: email,
        emailVerified: true,
      },
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    };

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
      session: session,
    });
  } catch (error) {
    console.error("Error verifying email:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Verification failed",
      },
      { status: 400 }
    );
  }
}
