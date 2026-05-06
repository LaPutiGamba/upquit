import { Suspense } from "react";
import { BoardPageContent } from "@/features/boards/components/BoardPageContent";
import { Skeleton } from "@/shared/components/ui/skeleton"; 

interface BoardPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { slug } = await params;
  return (
    <Suspense fallback={<Skeleton className="h-full w-full" />}>
      <BoardPageContent slug={slug} />
    </Suspense>
  );
}
