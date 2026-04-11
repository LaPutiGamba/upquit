"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

import { authService } from "@/features/authentication/services/authService";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import Link from "next/link";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");

  const [status, setStatus] = useState<"loading" | "success" | "error">(userId ? "loading" : "error");
  const StatusIcon = status === "success" ? CheckCircle2 : status === "error" ? XCircle : Loader2;

  useEffect(() => {
    if (!userId) return;

    const performVerification = async () => {
      try {
        await authService.verifyEmail(userId);
        setStatus("success");
      } catch (error) {
        console.error("Verification failed:", error);
        setStatus("error");
      }
    };

    performVerification();
  }, [userId]);

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="flex flex-col items-center gap-4">
          <span
            className={`flex h-12 w-12 items-center justify-center rounded-full ${
              status === "success"
                ? "bg-green-100 text-green-600"
                : status === "error"
                  ? "bg-red-100 text-red-600"
                  : "bg-primary/10 text-primary"
            }`}
          >
            <StatusIcon className={`h-6 w-6 ${status === "loading" ? "animate-spin" : ""}`} />
          </span>

          <CardTitle className="text-2xl font-bold">
            {status === "loading" && "Verifying your account..."}
            {status === "success" && "Account Verified!"}
            {status === "error" && "Verification Failed"}
          </CardTitle>

          <CardDescription className="text-base text-balance">
            {status === "loading" && "Please wait while we confirm your email address."}
            {status === "success" &&
              "Your email has been successfully verified. You can now access all features of UpQuit."}
            {status === "error" &&
              "The verification link is invalid or has expired. Please try logging in to request a new one."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Button asChild className="w-full" disabled={status === "loading"}>
            <Link href="/login">{status === "success" ? "Go to Dashboard" : "Back to Login"}</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
