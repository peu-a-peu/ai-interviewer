import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const orderId = searchParams.get("orderId");
  const paymentKey = searchParams.get("paymentKey");
  const amount = searchParams.get("amount");
  const email = searchParams.get("email");
  const interviews = searchParams.get("interviews");

  const secretKey = process.env.NEXT_PUBLIC_TOSS_SECRET_KEY;
  const url = "https://api.tosspayments.com/v1/payments/confirm";
  const basicToken = Buffer.from(`${secretKey}:`, "utf-8").toString("base64");

  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        amount,
        orderId,
        paymentKey,
      }),
      headers: {
        Authorization: `Basic ${basicToken}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (data.status === "DONE") {
      // Update ticket count
      if (email && interviews) {
        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1)
          .then((rows) => rows[0]);

        if (user) {
          await db
            .update(users)
            .set({
              ticketCount: (user.ticketCount || 0) + Number(interviews),
              updatedAt: new Date(),
            })
            .where(eq(users.email, email));
        }
      }

      return NextResponse.redirect(
        new URL(`/payment/complete?orderId=${orderId}`, request.url)
      );
    } else {
      return NextResponse.redirect(
        new URL(`/payment/fail?orderId=${orderId}`, request.url)
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Payment confirmation failed" },
      { status: 400 }
    );
  }
}

// Keep POST method for potential direct API calls
export async function POST(request: NextRequest) {
  return GET(request);
}
