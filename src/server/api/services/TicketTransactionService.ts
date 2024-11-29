import { db } from "@/server/db";
import { ticketTransactions, users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

class TicketTransactionService {
  static async recordTransaction(
    email: string,
    ticketBalanceChange: number,
    type: "PURCHASE" | "CONSUMPTION",
    description: string
  ) {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)
      .then((rows) => rows[0]);

    if (!user) {
      throw new Error("User not found");
    }

    await db.insert(ticketTransactions).values({
      userId: user.userId,
      ticketBalanceChange,
      type,
      description,
    });
  }
}

export default TicketTransactionService;
