"use client";

import { Link } from "@/localization/i18n/routing";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRightIcon, Plus, Presentation } from "lucide-react";
import { useTranslations } from "next-intl";

import { boardService, BoardResponse } from "@/features/boards/services/boardService";
import { CreateBoardForm } from "@/features/boards/components/CreateBoardForm";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/shared/components/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/shared/components/ui/empty";
import { Item, ItemGroup, ItemTitle, ItemDescription, ItemContent, ItemActions } from "@/shared/components/ui/item";

export function BoardsEntryGate() {
  const t = useTranslations("BoardsEntryGate");
  const router = useRouter();
  const [boards, setBoards] = useState<BoardResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const fetchBoards = async () => {
    const availableBoards = await boardService.getMyBoards();

    setBoards(availableBoards);
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;

    const resolveBoardsRoute = async () => {
      try {
        const availableBoards = await boardService.getMyBoards();

        if (!cancelled) {
          setBoards(availableBoards);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          router.replace("/login");
        }
      }
    };

    void resolveBoardsRoute();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const sortedBoards = useMemo(() => [...boards].sort((a, b) => a.name.localeCompare(b.name)), [boards]);

  if (loading) {
    return null;
  }

  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6 md:p-10">
        <header className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{t("title")}</h1>
            <p className="max-w-2xl text-muted-foreground">{t("subtitle")}</p>
          </div>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            {sortedBoards.length !== 0 && (
              <DialogTrigger asChild>
                <Button className="hover:cursor-pointer">
                  <Plus data-icon="inline-start" />
                  {t("createBoard")}
                </Button>
              </DialogTrigger>
            )}
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>{t("dialogTitle")}</DialogTitle>
                <DialogDescription>{t("dialogDescription")}</DialogDescription>
              </DialogHeader>
              <CreateBoardForm
                onSuccess={async () => {
                  setCreateDialogOpen(false);
                  await fetchBoards();
                }}
              />
            </DialogContent>
          </Dialog>
        </header>

        {sortedBoards.length === 0 ? (
          <section className="rounded-xl border border-dashed p-2">
            <Empty className="border-0 bg-transparent p-6 md:p-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Presentation className="size-5" aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
                <EmptyDescription>{t("emptyDescription")}</EmptyDescription>
              </EmptyHeader>
              <EmptyContent className="max-w-md flex-row flex-wrap justify-center gap-2">
                <Button onClick={() => setCreateDialogOpen(true)} className="hover:cursor-pointer">
                  {t("createBoard")}
                </Button>
                <Button variant="outline" disabled>
                  {t("importBoard")}
                </Button>
              </EmptyContent>
            </Empty>
          </section>
        ) : (
          <section>
            <ItemGroup className="gap-2">
              {sortedBoards.map((board) => (
                <Item
                  key={board.id}
                  asChild
                  variant="outline"
                  className="group rounded-lg border-border/70 bg-background px-4 py-3 transition-colors hover:bg-muted/40"
                >
                  <Link href={`/board/${board.slug}`}>
                    <ItemContent>
                      <ItemTitle className="text-base">{board.name}</ItemTitle>
                      <ItemDescription>{board.description || t("noDescription")}</ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      <ChevronRightIcon className="size-4 text-muted-foreground" />
                    </ItemActions>
                  </Link>
                </Item>
              ))}
            </ItemGroup>
          </section>
        )}
      </div>
    </main>
  );
}
