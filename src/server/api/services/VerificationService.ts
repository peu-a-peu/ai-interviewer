import { db } from "@/server/db";
import { verificationTokens } from "@/server/db/schema/verificationToken";
import { eq } from "drizzle-orm";

class VerificationService {
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

    return verificationToken.email;
  }
}

export default VerificationService;
