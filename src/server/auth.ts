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
import EmailProvider, {
  SendVerificationRequestParams,
} from "next-auth/providers/email";
import { env } from "@/env";
import { db } from "@/server/db";
import { users } from "./db/schema/user";
import { accounts } from "./db/schema/accounts";
import { sessions } from "./db/schema/sessions";
import { nextAuthVerificationToken } from "./db/schema/nextAuthVerificationToken";
import { getLocale } from "next-intl/server";

export const sendVerificationRequest = async ({
  identifier: email,
  url,
  provider,
}: SendVerificationRequestParams) => {
  const { server, from } = provider;
  // Send the email with your preferred library (e.g., Nodemailer)
  const locale = await getLocale();
  console.log("locale", locale);

  const emailContent = {
    en: {
      subject: "Your sign-in link for InterviewPrep",
      text: `Sign in to InterPrep by clicking the link: ${url}`,
      html: `
        <h1>Your sign-in link for Interview Prep</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${url}">${url}</a>
        <p>This link will expire in 24 hours.</p>
      `,
    },
    ko: {
      subject: `InterviewPrep에 대한 로그인 링크`,
      text: `다음 링크를 클릭하여 InterPrep에 로그인하십시오. ${url}`,
      html: `
        <h1>인터뷰 준비를 위한 로그인 링크</h1>
        <p>이메일 주소를 확인하려면 아래 링크를 클릭하세요:</p>
        <a href="${url}">${url}</a>
        <p>이 링크는 24시간 후에 만료됩니다.</p>
      `,
    },
  };
  const content = emailContent[locale === "en" ? "en" : "ko"];
  console.log("content", content);

  const nodemailer = require("nodemailer");
  const transport = nodemailer.createTransport(server);
  await transport.sendMail({
    to: email,
    from,
    subject: content.subject,
    text: content.text,
    html: content.html,
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
          ticketCount: user.ticketCount,
        },
      };
    },
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
        host: "smtp.gmail.com",
        port: 587, // TLS port
        secure: false,
        auth: {
          user: env.EMAIL_USER,
          pass: env.EMAIL_PASSWORD,
        },
      },
      sendVerificationRequest,
    }),
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
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
  pages: {
    verifyRequest: "/verify-email",
    signIn: "/login",
  },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
