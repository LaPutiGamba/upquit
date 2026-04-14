"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { BoardHeader } from "@/features/boards/components/BoardHeader";
import { boardService, BoardResponse } from "@/features/boards/services/boardService";
import { GiveToGetTracker } from "@/features/give-to-get/components/GiveToGetTracker";
import { RequestCard } from "@/features/requests/components/RequestCard";
import { CreateRequestForm } from "@/features/requests/components/CreateRequestForm";
import { requestService, RequestResponse } from "@/features/requests/services/requestService";

interface BoardPageContentProps {
  slug: string;
}

export function BoardPageContent({ slug }: BoardPageContentProps) {
  const t = useTranslations("BoardPage");
  const router = useRouter();
  const searchParams = useSearchParams();

  const [board, setBoard] = useState<BoardResponse | null>(null);
  const [requests, setRequests] = useState<RequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const isRequestsTab = searchParams.get("tab") === "requests";

  useEffect(() => {
    let cancelled = false;

    const loadBoardPage = async () => {
      try {
        const currentBoard = await boardService.getBoardBySlug(slug);

        if (cancelled) {
          return;
        }

        setBoard(currentBoard);

        if (isRequestsTab) {
          const boardRequests = await requestService.getRequestsByBoardId(currentBoard.id).catch(() => []);

          if (cancelled) {
            return;
          }

          setRequests(boardRequests);
        } else {
          setRequests([]);
        }
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
  }, [isRequestsTab, router, slug]);

  const requestsSortedByDate = useMemo(() => {
    return [...requests].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;

      return bTime - aTime;
    });
  }, [requests]);

  if (loading) {
    return null;
  }

  if (notFound || !board) {
    return (
      <main className="min-h-svh bg-background">
        <div className="mx-auto flex min-h-svh w-full max-w-6xl items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-md rounded-xl border border-dashed bg-card p-8 text-center">
            <p className="text-muted-foreground">Board not found.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6 pb-10 md:p-8 md:pb-12">
        <section className="rounded-xl border bg-card">
          <BoardHeader board={board} />
        </section>

        <GiveToGetTracker board={board} />

        {isRequestsTab ? (
          <section className="rounded-xl border bg-card p-5 md:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b pb-4">
              <h2 className="text-xl font-semibold tracking-tight md:text-2xl">{t("featureRequestsTitle")}</h2>
              <CreateRequestForm boardId={board.id} giveToGetEnabled={board.giveToGetEnabled} />
            </div>

            {requestsSortedByDate.length === 0 ? (
              <div className="rounded-xl border border-dashed bg-background py-12 text-center">
                <p className="text-muted-foreground">{t("emptyRequests")}</p>
              </div>
            ) : (
              <div className="grid gap-3 md:gap-4">
                {requestsSortedByDate.map((request) => (
                  <RequestCard key={request.id} request={request} boardSlug={slug} />
                ))}
              </div>
            )}
          </section>
        ) : null}
      </div>
    </main>
  );
}
