"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { boardService, BoardResponse } from "@/features/boards/services/boardService";
import { CommentSection } from "@/features/comments/components/CommentSection";
import { RequestHeader } from "@/features/requests/components/RequestHeader";
import { requestService, RequestResponse } from "@/features/requests/services/requestService";
import { Spinner } from "@/shared/components/ui/spinner";

interface RequestDetailPageContentProps {
  slug: string;
  id: string;
}

export function RequestDetailPageContent({ slug, id }: RequestDetailPageContentProps) {
  const router = useRouter();

  const [board, setBoard] = useState<BoardResponse | null>(null);
  const [request, setRequest] = useState<RequestResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadRequestPage = async () => {
      try {
        const currentBoard = await boardService.getBoardBySlug(slug);

        if (cancelled) {
          return;
        }

        setBoard(currentBoard);

        const currentRequest = await requestService.getRequestById(id, currentBoard.id);

        if (cancelled) {
          return;
        }

        setRequest(currentRequest);
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message = error instanceof Error ? error.message.toLowerCase() : "";
        const unauthorized =
          message.includes("session has expired") ||
          message.includes("unauthorized") ||
          message.includes("not authenticated");

        if (unauthorized) {
          router.replace("/login");
          return;
        }

        setNotFound(true);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadRequestPage();

    return () => {
      cancelled = true;
    };
  }, [id, router, slug]);

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
          <RequestHeader
            variant="page"
            metadataPosition="bottom"
            requestId={request.id}
            boardId={board.id}
            title={request.title}
            description={request.description}
            status={request.status}
            createdAt={request.createdAt}
            initialVoteCount={request.voteCount ?? 0}
          />
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
