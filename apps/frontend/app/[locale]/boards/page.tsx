import type { Metadata } from "next";
import { Suspense } from "react";
import { BoardsEntryGate } from "@/features/boards/components/BoardsEntryGate";
import { Skeleton } from "@/shared/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Boards | UpQuit",
  description: "Browse and manage your UpQuit boards."
};

export default function BoardsPage() {
  return (
    <Suspense fallback={<Skeleton className="min-h-svh w-full" />}>
      <BoardsEntryGate />
    </Suspense>
  );
}
