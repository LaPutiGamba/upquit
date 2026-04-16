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
import { Spinner } from "@/shared/components/ui/spinner";

interface RequestDetailPageContentProps {
  slug: string;
  id: string;
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "planned":
      return "border-primary/35 bg-primary/10 text-primary";
    case "in_progress":
      return "border-chart-2/35 bg-chart-2/12 text-chart-2";
    case "completed":
      return "border-chart-1/35 bg-chart-1/12 text-chart-1";
    case "rejected":
      return "border-destructive/35 bg-destructive/10 text-destructive";
    default:
      return "";
  }
}

function getStatusLabel(status: string) {
  const normalized = status.toLowerCase();

  switch (normalized) {
    case "in_progress":
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
        <section className="border-b pb-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="shrink-0">
              <UpvoteButton requestId={request.id} boardId={board.id} initialVoteCount={request.voteCount ?? 0} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={getStatusColor(request.status)}>
                  {getStatusLabel(request.status)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : ""}
                </span>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{request.title}</h1>
              <p
                className="mt-4 text-base leading-7 text-foreground/90"
                style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
              >
                {request.description}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mt-4 flex flex-col h-[66vh] min-h-90 max-h-190 min-w-0 overflow-hidden">
            <CommentSection requestId={request.id} boardId={board.id} />
          </div>
        </section>
      </main>
    </div>
  );
}
