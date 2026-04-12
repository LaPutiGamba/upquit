"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { boardService, BoardResponse } from "@/features/boards/services/boardService";
import { CommentSection } from "@/features/comments/components/CommentSection";
import { requestService, RequestResponse } from "@/features/requests/services/requestService";
import { UpvoteButton } from "@/features/votes/components/UpvoteButton";
import { Link } from "@/localization/i18n/routing";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { Spinner } from "@/shared/components/ui/spinner";

interface RequestDetailPageContentProps {
  slug: string;
  id: string;
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "planned":
      return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
    case "in_progress":
      return "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20";
    case "completed":
      return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
    case "rejected":
      return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
    default:
      return "bg-secondary text-secondary-foreground";
  }
}

function getStatusLabel(status: string) {
  const normalized = status.toLowerCase();

  switch (normalized) {
    case "in_progress":
      return "In Progress";
    case "planned":
      return "Planned";
    case "completed":
      return "Completed";
    case "rejected":
      return "Rejected";
    default:
      return status.replace("_", " ");
  }
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
      <main className="container mx-auto max-w-5xl px-4 min-h-screen flex items-center justify-center">
        <Spinner className="size-12" />
      </main>
    );
  }

  if (notFound || !board || !request) {
    return (
      <main className="container mx-auto max-w-5xl px-4 min-h-screen flex items-center justify-center">
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">Request not found.</p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="container mx-auto max-w-5xl px-4 pt-8 flex-1 flex flex-col">
        <div className="mb-8">
          <Button asChild variant="ghost" className="gap-2 pl-2 text-muted-foreground hover:text-foreground">
            <Link href={`/board/${slug}`}>
              <ArrowLeft className="size-4" />
              Back to Board
            </Link>
          </Button>
        </div>

        <section className="rounded-xl border bg-card p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="shrink-0">
              <UpvoteButton requestId={request.id} boardId={board.id} initialVoteCount={request.voteCount ?? 0} />
            </div>

            <div className="min-w-0 flex-1 space-y-4">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{request.title}</h1>

              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="outline" className={getStatusColor(request.status)}>
                  {getStatusLabel(request.status)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : ""}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-xl border bg-card p-6 sm:p-8">
          <div className="prose prose-neutral max-w-none dark:prose-invert">
            <p className="whitespace-pre-wrap text-base leading-7 text-foreground/90">{request.description}</p>
          </div>
        </section>

        <section className="mt-10 mb-8 flex flex-col min-h-0">
          <Separator />
          <div className="mt-6 flex h-[68vh] min-h-[360px] max-h-[760px] min-w-0 flex-col overflow-hidden rounded-xl border bg-card/60 p-4 sm:p-6">
            <CommentSection requestId={request.id} boardId={board.id} />
          </div>
        </section>
      </main>
    </div>
  );
}
