"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { BoardHeader } from "@/features/boards/components/BoardHeader";
import { useBoardPage } from "@/features/boards/hooks/useBoardPage";
import { GiveToGetTracker } from "@/features/give-to-get/components/GiveToGetTracker";
import { RequestCard } from "@/features/requests/components/RequestCard";
import { CreateRequestForm } from "@/features/requests/components/CreateRequestForm";
import { Badge } from "@/shared/components/ui/badge";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/shared/components/ui/empty";
import { MessageSquareDashed } from "lucide-react";

interface BoardPageContentProps {
  slug: string;
}

export function BoardPageContent({ slug }: BoardPageContentProps) {
  const t = useTranslations("BoardPage");
  const searchParams = useSearchParams();
  const { board, requests, latestRequestDate, loading, notFound } = useBoardPage(slug);
  const isRequestsTab = searchParams.get("tab") === "requests";

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
        {!isRequestsTab ? (
          <>
            <section>
              <BoardHeader board={board} />
            </section>

            <div>
              <GiveToGetTracker board={board} />
            </div>
          </>
        ) : null}

        {isRequestsTab ? (
          <section className="flex flex-col gap-5">
            <div className="mb-5 flex flex-col gap-4 border-b border-border/70 pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-semibold tracking-tight md:text-2xl">{t("featureRequestsTitle")}</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{requests.length} total</Badge>
                  {latestRequestDate ? <Badge variant="outline">Newest: {latestRequestDate}</Badge> : null}
                </div>
              </div>

              <CreateRequestForm boardId={board.id} giveToGetEnabled={board.giveToGetEnabled} />
            </div>

            {requests.length === 0 ? (
              <Empty className="rounded-xl border border-dashed py-12">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <MessageSquareDashed className="size-5" aria-hidden="true" />
                  </EmptyMedia>
                  <EmptyTitle>{t("featureRequestsTitle")}</EmptyTitle>
                  <EmptyDescription>{t("emptyRequests")}</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="grid gap-3 md:gap-4">
                {requests.map((request) => (
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
