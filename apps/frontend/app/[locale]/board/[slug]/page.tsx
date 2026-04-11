import { boardService } from "@/features/boards/services/boardService";
import { BoardHeader } from "@/features/boards/components/BoardHeader";
import { requestService } from "@/features/requests/services/requestService";
import { RequestCard } from "@/features/requests/components/RequestCard";
import { CreateRequestForm } from "@/features/requests/components/CreateRequestForm";
import { notFound } from "next/navigation";
import { GiveToGetTracker } from "@/features/give-to-get/components/GiveToGetTracker";
import { getTranslations } from "next-intl/server";

interface BoardPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BoardPage({ params }: BoardPageProps) {
  const t = await getTranslations("BoardPage");
  const { slug } = await params;

  const board = await boardService.getBoardBySlug(slug).catch(() => null);
  if (!board) {
    notFound();
  }

  const requests = await requestService.getRequestsByBoardId(board.id).catch(() => []);

  return (
    <main className="container mx-auto px-4 max-w-5xl min-h-screen flex flex-col gap-8 pb-12">
      <BoardHeader board={board} />

      <GiveToGetTracker board={board} />

      {/* Requests */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">{t("featureRequestsTitle")}</h2>
          <CreateRequestForm boardId={board.id} giveToGetEnabled={board.giveToGetEnabled} />
        </div>

        {requests.length === 0 ? (
          <div className="py-12 text-center border rounded-lg border-dashed">
            <p className="text-muted-foreground">{t("emptyRequests")}</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {requests.map((request) => (
              <RequestCard key={request.id} request={request} boardSlug={slug} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
