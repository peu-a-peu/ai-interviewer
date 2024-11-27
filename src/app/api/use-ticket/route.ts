import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    console.log(email);

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Get current user data
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)
      .then((rows) => rows[0]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.ticketCount < 1) {
      return NextResponse.json(
        { error: "No tickets available" },
        { status: 400 }
      );
    }

    // Update ticket count
    const result = await db
      .update(users)
      .set({
        ticketCount: user.ticketCount - 1,
        updatedAt: new Date(),
      })
      .where(eq(users.email, email))
      .returning({ updatedTicketCount: users.ticketCount });

    return NextResponse.json({
      success: true,
      data: result[0],
    });
  } catch (error) {
    console.error("Error using ticket:", error);
    return NextResponse.json(
      { error: "Failed to use ticket" },
      { status: 500 }
    );
  }
}
