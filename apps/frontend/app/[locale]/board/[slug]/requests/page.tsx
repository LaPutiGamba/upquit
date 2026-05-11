import { Suspense } from "react";
import type { Metadata } from "next";
import { BoardRequestsPageContent } from "@/features/boards/components/BoardRequestsPageContent";
import { Skeleton } from "@/shared/components/ui/skeleton";

interface BoardRequestsPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Requests — ${slug}`,
    description: `Feature requests for the ${slug} board on UpQuit.`
  };
}

export default async function BoardRequestsPage({ params }: BoardRequestsPageProps) {
  const { slug } = await params;
  return (
    <Suspense fallback={<Skeleton className="h-full w-full" />}>
      <BoardRequestsPageContent slug={slug} />
    </Suspense>
  );
}
