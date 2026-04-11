"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRightIcon, Presentation } from "lucide-react";
import { useTranslations } from "next-intl";

import { boardService, BoardResponse } from "@/features/boards/services/boardService";
import { CreateBoardForm } from "@/features/boards/components/CreateBoardForm";
import { Button } from "@/shared/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
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
import { Spinner } from "@/shared/components/ui/spinner";

export function BoardsEntryGate() {
  const t = useTranslations("BoardsEntryGate");
  const router = useRouter();
  const [boards, setBoards] = useState<BoardResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const fetchBoards = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.replace("/login");
      return;
    }

    const availableBoards = await boardService.getMyBoards(token);
    setBoards(availableBoards);
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;

    const resolveBoardsRoute = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          router.replace("/login");
          return;
        }

        const availableBoards = await boardService.getMyBoards(token);

        if (!cancelled) {
          setBoards(availableBoards);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setBoards([]);
          setLoading(false);
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
    return (
      <main className="flex min-h-svh items-center justify-center p-6 md:p-10">
        <Spinner className="size-12" />
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-6 p-6 md:p-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          {sortedBoards.length !== 0 && (
            <div className="flex items-center gap-2">
              <Button variant="outline" disabled>
                {t("importBoard")}
              </Button>
              <DialogTrigger asChild>
                <Button className="hover:cursor-pointer">{t("createBoard")}</Button>
              </DialogTrigger>
            </div>
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
          <ItemGroup>
            {sortedBoards.map((board) => (
              <Item key={board.id} asChild variant="outline">
                <Link href={`/board/${board.slug}`}>
                  <ItemContent>
                    <ItemTitle>{board.name}</ItemTitle>
                    <ItemDescription>{board.description || t("noDescription")}</ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <ChevronRightIcon className="size-4" />
                  </ItemActions>
                </Link>
              </Item>
            ))}
          </ItemGroup>
        </section>
      )}
    </main>
  );
}
