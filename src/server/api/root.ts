import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { interviewRouter } from "./routers/inteview";
import { companyRouter } from "./routers/companies";
import { authRouter } from "./routers/auth";
import { ticketRouter } from "./routers/ticket";
import { verificationRouter } from "./routers/verification";
import { emailVerificationRouter } from "./routers/emailVerification";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  interview: interviewRouter,
  company: companyRouter,
  auth: authRouter,
  ticket: ticketRouter,
  verification: verificationRouter,
  emailVerification: emailVerificationRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
