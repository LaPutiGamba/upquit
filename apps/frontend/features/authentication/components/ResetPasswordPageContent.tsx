"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, XCircle } from "lucide-react";
import ResetPasswordForm from "./ResetPasswordForm";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";

interface ResetPasswordPageContentProps {
  token: string | null;
  className?: string | null;
}

type TokenStatus = "validating" | "valid" | "invalid";

export function ResetPasswordPageContent({ token }: ResetPasswordPageContentProps & { className?: string }) {
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>("validating");

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (token && typeof token === "string" && token.length > 0) {
      timer = setTimeout(() => {
        setTokenStatus("valid");
      }, 300);
    } else {
      timer = setTimeout(() => {
        setTokenStatus("invalid");
      }, 0);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [token]);

  if (tokenStatus === "validating") {
    return (
      <main className="flex min-h-svh flex-col items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md text-center">
          <CardHeader className="flex flex-col items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Loader2 className="h-6 w-6 animate-spin" />
            </span>

            <CardTitle className="text-2xl font-bold">Validating reset link...</CardTitle>

            <CardDescription className="text-base text-balance">
              Please wait while we validate your password reset link.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  if (tokenStatus === "invalid") {
    return (
      <main className="flex min-h-svh flex-col items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md text-center">
          <CardHeader className="flex flex-col items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <XCircle className="h-6 w-6" />
            </span>

            <CardTitle className="text-2xl font-bold">Invalid Reset Link</CardTitle>

            <CardDescription className="text-base text-balance">
              The password reset link is invalid or has expired. Please request a new one.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Button asChild className="w-full">
              <Link href="/forgot-password">Request New Reset Link</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-background p-6 md:p-10">
      <ResetPasswordForm token={token || ""} className="w-full max-w-4xl" />
    </main>
  );
}
