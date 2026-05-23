"use client";

import { Link } from "@/localization/i18n/routing";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRightIcon, Plus, Presentation, Search } from "lucide-react";
import { useTranslations } from "next-intl";

import { boardService, BoardResponse } from "@/features/boards/services/boardService";
import { useAuth } from "@/shared/components/AuthProvider";
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
import { Input } from "@/shared/components/ui/input";

export function BoardsEntryGate() {
  const t = useTranslations("BoardsEntryGate");
  const router = useRouter();
  const { user } = useAuth();
  const [boards, setBoards] = useState<BoardResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 250);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;

    const resolveBoardsRoute = async () => {
      try {
        setLoading(true);
        const availableBoards = await boardService.getMyBoards({
          search: searchTerm || undefined
        });

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
  }, [router, searchTerm]);

  const sortedBoards = useMemo(() => {
    return boards.toSorted((a, b) => a.name.localeCompare(b.name));
  }, [boards]);

  const personalBoards = useMemo(
    () => sortedBoards.filter((board) => board.ownerId === user?.id),
    [sortedBoards, user?.id]
  );
  const joinedBoards = useMemo(
    () => sortedBoards.filter((board) => board.ownerId !== user?.id),
    [sortedBoards, user?.id]
  );

  const isSearchSettling = searchInput !== searchTerm;
  const isBusy = loading || isSearchSettling;
  const showEmptyState = !isBusy && sortedBoards.length === 0 && !searchInput;
  const showStatus = isBusy && sortedBoards.length === 0;
  const showPersonalSection = personalBoards.length > 0;
  const showJoinedSection = joinedBoards.length > 0;

  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6 md:p-10">
        <header className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{t("title")}</h1>
            <p className="max-w-2xl text-muted-foreground">{t("subtitle")}</p>
          </div>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" className="hover:cursor-pointer">
                <Link href="/boards/discover">{t("discoverBoards")}</Link>
              </Button>
              {sortedBoards.length !== 0 && (
                <DialogTrigger asChild>
                  <Button className="hover:cursor-pointer">
                    <Plus data-icon="inline-start" />
                    {t("createBoard")}
                  </Button>
                </DialogTrigger>
              )}
            </div>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>{t("dialogTitle")}</DialogTitle>
                <DialogDescription>{t("dialogDescription")}</DialogDescription>
              </DialogHeader>
              <CreateBoardForm
                onSuccess={async () => {
                  setCreateDialogOpen(false);
                  const availableBoards = await boardService.getMyBoards({
                    search: searchTerm || undefined
                  });
                  setBoards(availableBoards);
                }}
              />
            </DialogContent>
          </Dialog>
        </header>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
            placeholder={t("searchPlaceholder") || "Search boards..."}
          />
        </div>

        {showStatus ? (
          <p className="pt-1 text-sm text-muted-foreground">{loading ? "Loading boards..." : "Searching boards..."}</p>
        ) : showEmptyState ? (
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
              </EmptyContent>
            </Empty>
          </section>
        ) : personalBoards.length === 0 && joinedBoards.length === 0 && searchInput ? (
          <p className="pt-1 text-sm text-muted-foreground">No boards match your search.</p>
        ) : (
          <div className="flex flex-col gap-8">
            {showPersonalSection ? (
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">{t("personalTitle")}</h2>
                    <p className="text-sm text-muted-foreground">{t("personalDescription")}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{personalBoards.length}</span>
                </div>
                <ItemGroup className="gap-2">
                  {personalBoards.map((board) => (
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
            ) : null}

            {showJoinedSection ? (
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">{t("joinedTitle")}</h2>
                    <p className="text-sm text-muted-foreground">{t("joinedDescription")}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{joinedBoards.length}</span>
                </div>
                <ItemGroup className="gap-2">
                  {joinedBoards.map((board) => (
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
            ) : null}
          </div>
        )}
      </div>
    </main>
  );
}
