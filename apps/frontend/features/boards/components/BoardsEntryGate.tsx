"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { boardService, BoardResponse } from "@/features/boards/services/boardService";
import { decodeJwtPayload } from "@/shared/lib/jwt";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";

function parseBoardIdsFromToken(token: string): string[] {
  const decodedPayload = decodeJwtPayload(token);
  if (!decodedPayload || !Array.isArray(decodedPayload.boardIds)) {
    return [];
  }

  return decodedPayload.boardIds.filter((id): id is string => typeof id === "string" && id.length > 0);
}

export function BoardsEntryGate() {
  const router = useRouter();
  const [boards, setBoards] = useState<BoardResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const resolveBoardsRoute = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.replace("/login");
        return;
      }

      const boardIds = parseBoardIdsFromToken(token);
      if (boardIds.length === 0) {
        router.replace("/onboarding");
        return;
      }

      const boardResults = await Promise.all(
        boardIds.map((boardId) => boardService.getBoardById(boardId, token).catch(() => null))
      );
      const availableBoards = boardResults.filter((board): board is BoardResponse => board !== null);

      if (availableBoards.length === 0) {
        router.replace("/onboarding");
        return;
      }

      if (availableBoards.length === 1) {
        router.replace(`/board/${availableBoards[0].slug}`);
        return;
      }

      if (!cancelled) {
        setBoards(availableBoards);
        setLoading(false);
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
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Loading your boards...</CardTitle>
            <CardDescription>Checking where to take you next.</CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-6 p-6 md:p-10">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Select a board</h1>
        <p className="text-muted-foreground">Choose the workspace you want to manage.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        {sortedBoards.map((board) => (
          <Card key={board.id} className="transition-colors hover:border-primary/50">
            <CardHeader>
              <CardTitle>{board.name}</CardTitle>
              <CardDescription>{board.description ?? "No description yet."}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href={`/board/${board.slug}`}>Open board</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
