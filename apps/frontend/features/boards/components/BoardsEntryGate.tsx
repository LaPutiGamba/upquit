"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Presentation } from "lucide-react";

import { boardService, BoardResponse } from "@/features/boards/services/boardService";
import { CreateBoardForm } from "@/features/boards/components/CreateBoardForm";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
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

export function BoardsEntryGate() {
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
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Your boards</h1>
          <p className="text-muted-foreground">Manage your product feedback spaces.</p>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create board</Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Create a new board</DialogTitle>
              <DialogDescription>Answer these quick questions to set up your workspace.</DialogDescription>
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
              <EmptyTitle>No boards yet</EmptyTitle>
              <EmptyDescription>
                You haven&apos;t created any boards yet. Get started by creating your first board.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="max-w-md flex-row flex-wrap justify-center gap-2">
              <Button onClick={() => setCreateDialogOpen(true)}>Create board</Button>
              <Button variant="outline" disabled>
                Import board
              </Button>
            </EmptyContent>
          </Empty>
        </section>
      ) : (
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
      )}
    </main>
  );
}
