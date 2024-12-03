import { db } from "@/server/db";
import { ticketTransactions } from "@/server/db/schema/ticketTransaction";
import { users } from "@/server/db/schema/user";
import { verificationTokens } from "@/server/db/schema/verificationToken";
import { eq } from "drizzle-orm";

class VerificationService {
  static sendVerification(email: string) {
    throw new Error("Method not implemented.");
  }
  static async createVerificationToken(email: string, token: string) {
    const expires = new Date();
    expires.setHours(expires.getHours() + 24); // Token expires in 24 hours

    // Check if email already exists
    const existingToken = await db
      .select()
      .from(verificationTokens)
      .where(eq(verificationTokens.email, email))
      .limit(1);

    if (existingToken.length > 0) {
      // Delete existing token first
      await db
        .delete(verificationTokens)
        .where(eq(verificationTokens.email, email));
    }

    // Insert new token
    await db.insert(verificationTokens).values({
      email,
      token,
      expires,
    });

    // await db
    //   .update(verificationTokens)
    //   .set({ status: true })
    //   .where(eq(verificationTokens.email, email));
  }
  static async verifyToken(token: string) {
    const result = await db
      .select()
      .from(verificationTokens)
      .where(eq(verificationTokens.token, token))
      .limit(1);

    const verificationToken = result[0];

    if (!verificationToken) {
      throw new Error("Invalid token");
    }

    if (new Date() > verificationToken.expires) {
      throw new Error("Token has expired");
    }

    const email = verificationToken.email;
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length === 0) {
      // Insert the user without specifying `userId`
      await db.insert(users).values({
        email,
        ticketCount: 1, // Default ticket count
        updatedAt: new Date(),
      });

      const user = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      console.log("user: ", user);

      if (!user[0]?.userId) {
        throw new Error("User not found");
      }

      await db.insert(ticketTransactions).values({
        userId: user[0].userId,
        ticketBalanceChange: 1,
        type: "PURCHASE",
        description: "free ticket",
        createdAt: new Date(),
      });
    }

    return verificationToken.email;
  }
}

export default VerificationService;
