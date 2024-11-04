import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { TRPCReactProvider } from "@/trpc/react";
import { getLocale, getMessages } from "next-intl/server";
import Navbar from "./components/navigation/Navbar";

export const metadata: Metadata = {
  title: "AI Interviewer",
  description: "AI Interviewer - your ultimate guide to cracking interviews",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale()
  const messages = await getMessages();
  return (
    <html lang={locale} className={`${GeistSans.variable}`}>
      <head>
        {locale === 'en' && (
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap"
            rel="stylesheet"
          />
        )}
        {locale === 'ko' && (
          <link
            href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
            rel="stylesheet"
          />
        )}
      </head>
      <body className="main-gradient">
        <Navbar />
        <NextIntlClientProvider messages={messages}>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
