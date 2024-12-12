import { DrizzleAdapter } from "@auth/drizzle-adapter";
import {
  DefaultUser,
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider, { SendVerificationRequestParams } from "next-auth/providers/email";
import { env } from "@/env";
import { db } from "@/server/db";
import { users } from "./db/schema/user";
import { accounts } from "./db/schema/accounts";
import { sessions } from "./db/schema/sessions";
import { nextAuthVerificationToken } from "./db/schema/nextAuthVerificationToken";


export const sendVerificationRequest = async ({
  identifier: email,
  url,
  provider,
}: SendVerificationRequestParams) => {
  const { server, from } = provider;
  // Send the email with your preferred library (e.g., Nodemailer)
  const nodemailer = require("nodemailer");
  const transport = nodemailer.createTransport(server);
  await transport.sendMail({
    to: email,
    from,
    subject: "Your sign-in link for MyApp",
    text: `Sign in to MyApp by clicking the link: ${url}`,
    html: `
    <h1>Your sign-in link for InterviewPrep</h1>
    <p>Please click the link below to verify your email address:</p>
    <a href="${url}">${url}</a>
    <p>This link will expire in 24 hours.</p>
  `,
  });
};


/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      ticketCount: number; // Add custom fields here
    } & DefaultSession["user"]; // Merge with DefaultSession["user"]
  }

  interface User extends DefaultUser {
    ticketCount: number; // Add custom fields here
  }

}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session: ({ session, user }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: user?.id,
          ticketCount: user.ticketCount
        },
      }
    }
  },
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: nextAuthVerificationToken,
  }) as Adapter,
  providers: [

    EmailProvider({
      from: env.EMAIL_USER,
      server: {
        host: 'smtp.gmail.com',
        port: 587,         // TLS port
        secure: false,
        auth: {
          user: env.EMAIL_USER,
          pass: env.EMAIL_PASSWORD,
        },
      },
      sendVerificationRequest
    }),
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  pages:{
    verifyRequest:'/verify-email',
    signIn:'/login'
  },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
