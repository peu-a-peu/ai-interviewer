import { env } from "@/env";
import Stripe from "stripe"
import { TRPCContext } from "@/app/api/trpc/[trpc]/route";
import { TRPCError } from "@trpc/server";
import { STRIPE_LINE_ITEMS } from "@/common/constants/stripe";
import { db } from "@/server/db";
import { TransactionDetails, users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

class StripeController {

    static stripe: Stripe = new Stripe(env.STRIPE_SECRET_KEY);



    static async createCheckoutSession(input: { priceId: string }, ctx: TRPCContext) {

        const lineItem = STRIPE_LINE_ITEMS[input.priceId]
        if (!lineItem) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Bad payload received"
            })
        }
        const session = await this.stripe.checkout.sessions.create({
            mode: 'payment',
            line_items: [lineItem],
            metadata: {
                userId: ctx.session?.user.id || "",
                tickets: lineItem.price_data?.product_data?.metadata?.tickets as number
            },
            customer_email: ctx.session?.user.email || "",
            success_url: `${env.NEXTAUTH_URL}/payment/stripe/complete?session_id={CHECKOUT_SESSION_ID}`,
        })
        return { sessionId: session.id }
    }

    static async processSession(input: { sessionId: string }) {
        const sessionId = input.sessionId
        const isSessionProcessed = await db.select({ orderId: TransactionDetails.orderId }).from(TransactionDetails).where(eq(TransactionDetails.orderId, sessionId))
        if (isSessionProcessed.length) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Session is invalid",
            });
        }

        const session = await this.stripe.checkout.sessions.retrieve(input.sessionId);
        if (!session) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Session not found",
            });
        }

        const userId = session.metadata?.userId as string
        const tickets = parseInt(session.metadata?.tickets || '0')
        const orderId = session.id
        const paymentAmount = `${(session.amount_total || 0) / 100} ${session.currency}`
        const orderName = `${tickets} tickets payment in ${session.currency}`
        const paymentKey = session.payment_intent as string
        const paymentStatus = session.payment_status || ""
        const user = (await db.select({ ticketCount: users.ticketCount }).from(users).where(eq(users.id, userId)))?.[0]
        if (!user) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "User not found",
            });
        }
        await db.transaction(async (tx) => {

            await tx.update(users).set({
                ticketCount: user.ticketCount + tickets,
                updatedAt: new Date(),
            }).where(eq(users.id, userId))

            await tx.insert(TransactionDetails).values({
                userId,
                orderId,
                orderName,
                paymentKey,
                paymentStatus,
                paymentAmount,
                data: JSON.stringify(session),
                service: "stripe"
            });
        })

        return {
            orderId,
            paymentAmount,
            sessionStatus: session.status,
            paymentStatus
        }
    }

}

export default StripeController