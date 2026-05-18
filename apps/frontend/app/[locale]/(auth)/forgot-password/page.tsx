import type { Metadata } from "next";
import ForgotPasswordForm from "@/features/authentication/components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your UpQuit password"
};

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-background p-6 md:p-10">
      <ForgotPasswordForm className="w-full max-w-4xl" />
    </main>
  );
}
