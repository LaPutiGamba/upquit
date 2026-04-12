"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { BoardHeader } from "@/features/boards/components/BoardHeader";
import { boardService, BoardResponse } from "@/features/boards/services/boardService";
import { GiveToGetTracker } from "@/features/give-to-get/components/GiveToGetTracker";
import { RequestCard } from "@/features/requests/components/RequestCard";
import { CreateRequestForm } from "@/features/requests/components/CreateRequestForm";
import { requestService, RequestResponse } from "@/features/requests/services/requestService";
import { Spinner } from "@/shared/components/ui/spinner";

interface BoardPageContentProps {
  slug: string;
}

export function BoardPageContent({ slug }: BoardPageContentProps) {
  const t = useTranslations("BoardPage");
  const router = useRouter();

  const [board, setBoard] = useState<BoardResponse | null>(null);
  const [requests, setRequests] = useState<RequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadBoardPage = async () => {
      try {
        const currentBoard = await boardService.getBoardBySlug(slug);

        if (cancelled) {
          return;
        }

        setBoard(currentBoard);

        const boardRequests = await requestService.getRequestsByBoardId(currentBoard.id).catch(() => []);

        if (cancelled) {
          return;
        }

        setRequests(boardRequests);
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

    void loadBoardPage();

    return () => {
      cancelled = true;
    };
  }, [router, slug]);

  const requestsSortedByDate = useMemo(() => {
    return [...requests].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;

      return bTime - aTime;
    });
  }, [requests]);

  if (loading) {
    return (
      <main className="container mx-auto px-4 max-w-5xl min-h-screen flex items-center justify-center">
        <Spinner className="size-12" />
      </main>
    );
  }

  if (notFound || !board) {
    return (
      <main className="container mx-auto px-4 max-w-5xl min-h-screen flex items-center justify-center">
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">Board not found.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 max-w-5xl min-h-screen flex flex-col gap-8 pb-12">
      <BoardHeader board={board} />

      <GiveToGetTracker board={board} />

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">{t("featureRequestsTitle")}</h2>
          <CreateRequestForm boardId={board.id} giveToGetEnabled={board.giveToGetEnabled} />
        </div>

        {requestsSortedByDate.length === 0 ? (
          <div className="py-12 text-center border rounded-lg border-dashed">
            <p className="text-muted-foreground">{t("emptyRequests")}</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {requestsSortedByDate.map((request) => (
              <RequestCard key={request.id} request={request} boardSlug={slug} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
