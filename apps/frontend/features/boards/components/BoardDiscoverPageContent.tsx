"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Search, Users } from "lucide-react";

import { Link } from "@/localization/i18n/routing";
import { boardService, type BoardResponse, type PublicBoardSortBy } from "@/features/boards/services/boardService";
import { useAuth } from "@/shared/components/AuthProvider";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { toast } from "@/shared/components/ui/sonner";

const PAGE_SIZE = 12;

export function BoardDiscoverPageContent() {
  const t = useTranslations("BoardsDiscoverPage");
  const { user, boards, refreshBoards } = useAuth();

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<PublicBoardSortBy>("recent");
  const [offset, setOffset] = useState(0);
  const [results, setResults] = useState<BoardResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [joiningBoardId, setJoiningBoardId] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setOffset(0);
    }, 250);

    return () => {
      clearTimeout(timeout);
    };
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;

    const loadBoards = async () => {
      setLoading(true);

      try {
        const boardsResponse = await boardService.searchPublicBoards({
          search: searchTerm,
          sortBy,
          limit: PAGE_SIZE,
          offset
        });

        if (!cancelled) {
          setResults(boardsResponse);
          setHasNextPage(boardsResponse.length === PAGE_SIZE);
        }
      } catch {
        if (!cancelled) {
          setResults([]);
          setHasNextPage(false);
          toast.error(t("errors.searchFailed"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadBoards();

    return () => {
      cancelled = true;
    };
  }, [offset, searchTerm, sortBy, t]);

  const joinedBoardIds = useMemo(() => new Set(boards.map((board) => board.id)), [boards]);

  const handleJoinBoard = async (board: BoardResponse) => {
    if (!user) {
      return;
    }

    setJoiningBoardId(board.id);

    try {
      await boardService.joinBoard(board.id);
      await refreshBoards();
      toast.success(t("success.joined", { boardName: board.name }));
    } catch {
      toast.error(t("errors.joinFailed"));
    } finally {
      setJoiningBoardId(null);
    }
  };

  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6 md:p-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{t("title")}</h1>
          <p className="max-w-2xl text-muted-foreground">{t("subtitle")}</p>
        </header>

        <section className="grid gap-4 rounded-xl border bg-card p-4 md:grid-cols-[1fr_220px] md:items-end">
          <div className="space-y-2">
            <Label htmlFor="discover-search">{t("filters.searchLabel")}</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="discover-search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className="pl-9"
                placeholder={t("filters.searchPlaceholder")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("filters.sortLabel")}</Label>
            <Select
              value={sortBy}
              onValueChange={(nextValue) => {
                setSortBy(nextValue as PublicBoardSortBy);
                setOffset(0);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("filters.sortLabel")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">{t("filters.sortRecent")}</SelectItem>
                <SelectItem value="name">{t("filters.sortName")}</SelectItem>
                <SelectItem value="members">{t("filters.sortMembers")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        {loading ? (
          <p className="text-sm text-muted-foreground">{t("loading")}</p>
        ) : results.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">{t("empty")}</div>
        ) : (
          <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {results.map((board) => {
              const isOwner = user?.id === board.ownerId;
              const isJoined = isOwner || joinedBoardIds.has(board.id);
              const isJoining = joiningBoardId === board.id;

              return (
                <Card key={board.id} className="border-border/70">
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="line-clamp-1 text-base">{board.name}</CardTitle>
                      <Badge variant="secondary">{t("publicBadge")}</Badge>
                    </div>
                    <CardDescription className="line-clamp-2 min-h-10">
                      {board.description || t("noDescription")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {t("ownerBy", { owner: board.ownerDisplayName || board.ownerUsername || t("unknownOwner") })}
                    </p>
                    <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="size-3.5" />
                      {t("communityLabel")}
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-end gap-2">
                    {isJoined && (
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/board/${board.slug}`}>{t("viewBoard")}</Link>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      disabled={isJoined || isJoining}
                      onClick={() => {
                        void handleJoinBoard(board);
                      }}
                    >
                      {isJoined ? t("joined") : isJoining ? t("joining") : t("join")}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </section>
        )}

        <section className="flex items-center justify-between">
          <Button
            variant="outline"
            disabled={offset === 0 || loading}
            onClick={() => setOffset((previousOffset) => Math.max(0, previousOffset - PAGE_SIZE))}
          >
            {t("pagination.previous")}
          </Button>
          <Button
            variant="outline"
            disabled={!hasNextPage || loading}
            onClick={() => setOffset((previousOffset) => previousOffset + PAGE_SIZE)}
          >
            {t("pagination.next")}
          </Button>
        </section>
      </div>
    </main>
  );
}
