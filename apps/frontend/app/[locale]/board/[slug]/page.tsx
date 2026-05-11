import { Suspense } from "react";
import type { Metadata } from "next";
import { BoardPageContent } from "@/features/boards/components/BoardPageContent";
import { Skeleton } from "@/shared/components/ui/skeleton";

interface BoardPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string | string[] }>;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params;
  return {
    title: `Board — ${slug}`,
    description: `View and interact with the ${slug} board on UpQuit.`
  };
}

export default async function BoardPage({ params, searchParams }: BoardPageProps) {
  const [{ slug }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const tab = Array.isArray(resolvedSearchParams.tab) ? resolvedSearchParams.tab[0] : resolvedSearchParams.tab;
  return (
    <Suspense fallback={<Skeleton className="h-full w-full" />}>
      <BoardPageContent slug={slug} isRequestsTab={tab === "requests"} />
    </Suspense>
  );
}
