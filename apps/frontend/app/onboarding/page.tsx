import { CreateBoardForm } from "@/features/boards/components/CreateBoardForm";

export default function OnboardingPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full flex flex-col items-center gap-6">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold tracking-tight">Bienvenido a UpQuit</h1>
          <p className="text-muted-foreground mt-2">Vamos a configurar tu primer tablero de sugerencias.</p>
        </div>
        <CreateBoardForm />
      </div>
    </main>
  );
}
