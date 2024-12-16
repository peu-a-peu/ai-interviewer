import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import TicketTransactionService from "@/server/api/services/TicketTransactionService";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User Id is required" }, { status: 400 });
    }

    // Get current user data
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
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
      .where(eq(users.id, userId))
      .returning({ updatedTicketCount: users.ticketCount });

    // Record the transaction
    await TicketTransactionService.recordTransaction(
      userId,
      -1,
      "CONSUMPTION",
      "Used 1 interview ticket"
    );

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
