"use client";

import { useRequestDetailPage } from "@/features/requests/hooks/useRequestDetailPage";

import { CommentSection } from "@/features/comments/components/CommentSection";
import { RequestDescription, RequestHeader, RequestTitle } from "@/features/requests/components/RequestHeader";
import { RequestMetadataRow } from "@/features/requests/components/RequestMetadataRow";
import { Spinner } from "@/shared/components/ui/spinner";

interface RequestDetailPageContentProps {
  slug: string;
  id: string;
}

export function RequestDetailPageContent({ slug, id }: RequestDetailPageContentProps) {
  const { board, request, loading, notFound } = useRequestDetailPage(slug, id);

  if (loading) {
    return (
      <main className="container mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4">
        <Spinner className="size-12" />
      </main>
    );
  }

  if (notFound || !board || !request) {
    return (
      <main className="container mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4">
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">Request not found.</p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto flex max-w-6xl flex-1 flex-col px-4 py-8 md:py-10">
        <section className="pb-8">
          <RequestHeader variant="page">
            <RequestTitle variant="page" as="h1">
              {request.title}
            </RequestTitle>
            <RequestDescription>{request.description ?? ""}</RequestDescription>
            <RequestMetadataRow request={request} boardId={board.id} size="md" className="mt-3" />
          </RequestHeader>
        </section>

        <section>
          <div className="mt-4 flex flex-col h-[66vh] min-h-90 max-h-190 min-w-0 overflow-hidden">
            <CommentSection requestId={request.id} boardId={board.id} />
          </div>
        </section>
      </main>
    </div>
  );
}
