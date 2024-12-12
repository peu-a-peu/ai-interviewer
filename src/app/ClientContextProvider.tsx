"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { TRPCReactProvider } from "@/trpc/react"; 
import { NextIntlClientProvider } from "next-intl"; 

interface ClientContextProviderProps {
  children: ReactNode;
  messages: any;
  locale: string;
}

export default function ClientContextProvider({
  children,
  messages,
  locale,
}: ClientContextProviderProps) {
  return (
    <SessionProvider>
      <TRPCReactProvider>
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
        </NextIntlClientProvider>
      </TRPCReactProvider>
    </SessionProvider>
  );
}
