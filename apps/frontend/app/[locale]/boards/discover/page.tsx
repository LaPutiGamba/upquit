import type { Metadata } from "next";
import { Suspense } from "react";
import { BoardDiscoverPageContent } from "@/features/boards/components/BoardDiscoverPageContent";
import { Skeleton } from "@/shared/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Discover Boards | UpQuit",
  description: "Search public boards and join communities."
};

export default function DiscoverBoardsPage() {
  return (
    <Suspense fallback={<Skeleton className="min-h-svh w-full" />}>
      <BoardDiscoverPageContent />
    </Suspense>
  );
}
