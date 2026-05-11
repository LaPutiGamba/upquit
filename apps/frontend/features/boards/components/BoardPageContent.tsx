"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { BoardHeader } from "@/features/boards/components/BoardHeader";
import { useBoardPage } from "@/features/boards/hooks/useBoardPage";
import { boardService } from "@/features/boards/services/boardService";
import { GiveToGetTracker } from "@/features/give-to-get/components/GiveToGetTracker";
import { useAuth } from "@/shared/components/AuthProvider";

interface BoardPageContentProps {
  slug: string;
}

export function BoardPageContent({ slug }: BoardPageContentProps) {
  const t = useTranslations("BoardPage");
  const { user } = useAuth();
  const { board, loading, notFound } = useBoardPage(slug, false);
  const [canManageBoard, setCanManageBoard] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const resolvePermissions = async () => {
      let nextCanManageBoard = false;

      if (board && user) {
        if (board.ownerId === user.id) {
          nextCanManageBoard = true;
        } else {
          try {
            const members = await boardService.getBoardMembers(board.id);

            nextCanManageBoard = members.some((member) => member.userId === user.id && member.role === "admin");
          } catch {
            nextCanManageBoard = false;
          }
        }
      }

      if (!cancelled) {
        setCanManageBoard(nextCanManageBoard);
      }
    };

    void resolvePermissions();

    return () => {
      cancelled = true;
    };
  }, [board, user]);

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
        <section>
          <BoardHeader board={board} canManage={canManageBoard} manageLabel={t("actions.editSettings")} />
        </section>

        <div>
          <GiveToGetTracker board={board} />
        </div>
      </div>
    </main>
  );
}
