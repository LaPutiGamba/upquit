import type { Metadata } from "next";
import { ViewTransition } from "react";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "../globals.css";
import { cn } from "@/shared/lib/utils";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { ThemeProvider } from "@/shared/components/ThemeProvider";
import { Toaster } from "@/shared/components/ui/sonner";
import { WebSocketProvider } from "@/shared/components/WebSocketProvider";
import { AppShell } from "@/shared/components/AppShell";
import { AuthProvider } from "@/shared/components/AuthProvider";

import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "UpQuit",
  description: "Author Arià Aragón"
};

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <WebSocketProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              <TooltipProvider>
                <ViewTransition default="none">
                  <AuthProvider>
                    <AppShell>{children}</AppShell>
                  </AuthProvider>
                </ViewTransition>
              </TooltipProvider>
              <Toaster />
            </ThemeProvider>
          </WebSocketProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
