"use client";

import Link from "next/link";
import { Mail } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";

export default function VerifyEmailPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-background p-6 md:p-10">
      <Card className="w-full max-w-md border-none shadow-none bg-transparent sm:bg-card sm:border sm:shadow-sm">
        <CardHeader className="flex flex-col items-center gap-4 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail className="h-6 w-6" />
          </span>
          <CardTitle className="text-2xl font-bold tracking-tight">Check your email</CardTitle>
          <CardDescription className="text-balance text-base">
            We&apos;ve sent a verification link to your email address. Please verify your account to start using UpQuit.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button asChild className="w-full" size="lg">
            <Link href="/login">Return to Login</Link>
          </Button>
          <CardDescription className="text-center text-xs">
            Didn&apos;t receive the email? Check your spam folder or contact support.
          </CardDescription>
        </CardContent>
      </Card>
    </main>
  );
}
