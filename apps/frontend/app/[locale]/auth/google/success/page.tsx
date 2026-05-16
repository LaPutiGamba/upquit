"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { handleGoogleOAuthCallback } from "@/features/authentication/services/authService";
import { toast } from "@/shared/components/ui/sonner";
import { resolveAuthenticatedRedirectPath } from "@/features/authentication/services/authRedirectService";

export default function GoogleSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get("token");
        const error = searchParams.get("error");

        if (error) {
          toast.error(`Google sign-in failed: ${error}`);
          router.push("/login");
          return;
        }

        if (!token) {
          toast.error("No authentication token received");
          router.push("/login");
          return;
        }

        await handleGoogleOAuthCallback({ token });

        const destination = await resolveAuthenticatedRedirectPath();
        router.push(destination);
      } catch (error) {
        console.error("Google OAuth callback error:", error);
        toast.error("Authentication failed");
        router.push("/login");
      }
    };

    void handleCallback();
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p>Completing sign-in...</p>
      </div>
    </div>
  );
}
