import { db } from "@/server/db";
import { users } from "@/server/db/schema/user";
import { verificationTokens } from "@/server/db/schema/verificationToken";
import { eq } from "drizzle-orm";

class VerificationService {
  static async createVerificationToken(email: string, token: string) {
    console.log("1");
    const expires = new Date();
    expires.setHours(expires.getHours() + 24); // Token expires in 24 hours

    // Check if email already exists
    const existingToken = await db
      .select()
      .from(verificationTokens)
      .where(eq(verificationTokens.email, email))
      .limit(1);
    console.log("2");
    console.log(existingToken);

    if (existingToken.length > 0) {
      // Delete existing token first
      await db
        .delete(verificationTokens)
        .where(eq(verificationTokens.email, email));
    }
    console.log("3");

    // Insert new token
    await db.insert(verificationTokens).values({
      email,
      token,
      expires,
    });

    console.log("4");
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
    }

    return verificationToken.email;
  }
}

export default VerificationService;
