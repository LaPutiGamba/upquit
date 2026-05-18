import type { Metadata } from "next";
import { ResetPasswordPageContent } from "@/features/authentication/components/ResetPasswordPageContent";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your UpQuit password"
};

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string | string[] }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const resolvedSearchParams = await searchParams;
  const token = Array.isArray(resolvedSearchParams.token)
    ? resolvedSearchParams.token[0]
    : (resolvedSearchParams.token ?? null);

  return <ResetPasswordPageContent token={token} />;
}
