import LoginForm from "@/features/authentication/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-muted/20">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl place-items-center px-4 py-10">
        <LoginForm />
      </div>
    </main>
  );
}
