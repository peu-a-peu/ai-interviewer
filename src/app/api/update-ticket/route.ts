import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { email, ticketCount } = await request.json();

    const result = await db
      .update(users)
      .set({
        ticketCount: ticketCount,
        updatedAt: new Date(),
      })
      .where(eq(users.email, email))
      .returning({ updatedTicketCount: users.ticketCount });

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error) {
    console.error("Error updating ticket count:", error);
    return NextResponse.json(
      { error: "Failed to update ticket count" },
      { status: 500 }
    );
  }
}
