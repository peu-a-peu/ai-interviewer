import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import TicketTransactionService from "@/server/api/services/TicketTransactionService";
import { TransactionDetails } from "@/server/db/schema/transaction";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const orderId = searchParams.get("orderId");
  const paymentKey = searchParams.get("paymentKey");
  const amount = searchParams.get("amount");
  const secretKey = process.env.NEXT_PUBLIC_TOSS_SECRET_KEY;
  const url = "https://api.tosspayments.com/v1/payments/confirm";
  const basicToken = Buffer.from(`${secretKey}:`, "utf-8").toString("base64");

  interface TossPaymentResponse {
    version: string;
    paymentKey: string;
    type: string;
    orderId: string;
    orderName: string;
    mId: string;
    currency: string;
    method: string;
    totalAmount: number;
    balanceAmount: number;
    status: string;
    requestedAt: string;
    approvedAt: string;
    useEscrow: boolean;
    lastTransactionKey?: string;
    suppliedAmount: number;
    vat: number;
    cultureExpense: number;
    taxFreeAmount: number;
    taxExemptionAmount: number;
    metadata:Record<string,string>
  }
  // const id = localStorage.getItem("userId");
  // console.log("payment ", id);

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

    const data = (await response.json()) as TossPaymentResponse;

    console.log("data", data);
    const {userId, tickets} = data.metadata
    if (data.status === "DONE") {
      // Update ticket count
      if (userId && tickets) {
        const user = await db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .then((rows) => rows[0]);
        if (user) {
          // Store payment transaction
          await db.insert(TransactionDetails).values({
            userId: user.id,
            orderId: data.orderId,
            orderName: data.orderName,
            paymentKey: data.paymentKey,
            paymentStatus: data.status,
            paymentAmount: data.totalAmount.toString(),
            data: JSON.stringify(data),
            service:"tosspayments"
          });

          await db
            .update(users)
            .set({
              ticketCount: (user.ticketCount || 0) + Number(tickets),
              updatedAt: new Date(),
            })
            .where(eq(users.id, userId));

          // Record the transaction
          await TicketTransactionService.recordTransaction(
            userId,
            Number(tickets),
            "PURCHASE",
            `Purchased ${tickets} interview tickets`
          );
        }
      }

      return NextResponse.redirect(new URL("/", request.url));
    } else {
      return NextResponse.redirect(
        new URL(`/payment/fail?orderId=${orderId}`, request.url)
      );
    }
  } catch (error) {
    console.log(error)
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
