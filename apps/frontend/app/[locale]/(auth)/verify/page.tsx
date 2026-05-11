import type { Metadata } from "next";
import { VerifyPageContent } from "@/features/authentication/components/VerifyPageContent";

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Verify your email address to activate your account"
};

interface VerifyPageProps {
  searchParams: Promise<{ id?: string | string[] }>;
}

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const resolvedSearchParams = await searchParams;
  const userId = Array.isArray(resolvedSearchParams.id)
    ? resolvedSearchParams.id[0]
    : (resolvedSearchParams.id ?? null);

  return <VerifyPageContent userId={userId} />;
}
