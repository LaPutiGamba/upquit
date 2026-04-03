import RegisterForm from "@/features/authentication/components/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-muted/20">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl place-items-center px-4 py-10">
        <RegisterForm />
      </div>
    </main>
  );
}
