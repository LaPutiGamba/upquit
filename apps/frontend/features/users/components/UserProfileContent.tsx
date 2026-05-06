"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/localization/i18n/routing";
import { UserResponse } from "@/features/authentication/services/authService";
import { boardService, BoardResponse } from "@/features/boards/services/boardService";
import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "@/shared/components/ui/item";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/shared/components/ui/empty";
import { PresentationIcon, ChevronRightIcon } from "lucide-react";

interface UserProfileContentProps {
  user: UserResponse;
}

export default function UserProfileContent({ user }: UserProfileContentProps) {
  const t = useTranslations("users.profile");
  const [publicBoards, setPublicBoards] = useState<BoardResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long"
    }).format(dateObj);
  };

  useEffect(() => {
    const fetchPublicBoards = async () => {
      try {
        const boards = await boardService.getPublicBoardsByUserId(user.id);
        setPublicBoards(boards);
      } catch {
        setPublicBoards([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicBoards();
  }, [user.id]);

  if (!user.isActive) {
    return (
      <main className="min-h-svh bg-background">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6 md:p-10">
          <Empty>
            <EmptyContent>
              <EmptyMedia>
                <PresentationIcon />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>{t("deleted")}</EmptyTitle>
                <EmptyDescription>This user account has been deleted</EmptyDescription>
              </EmptyHeader>
            </EmptyContent>
          </Empty>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6 md:p-10">
        {/* Profile Header */}
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:gap-8">
          {/* Avatar */}
          <div className="shrink-0">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.displayName}
                width={120}
                height={120}
                className="rounded-full w-32 h-32 object-cover"
                priority
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <span className="text-4xl font-bold text-white">{user.displayName.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-semibold tracking-tight">{user.displayName}</h1>
            <p className="text-lg text-muted-foreground mt-1">@{user.username}</p>

            {user.createdAt && (
              <p className="text-sm text-muted-foreground mt-4">
                {t("joinedOn")} {formatDate(user.createdAt)}
              </p>
            )}
          </div>
        </div>

        {/* Public Boards Section */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">{t("publicBoards")}</h2>
          </div>

          {loading ? (
            <div className="text-center text-muted-foreground">{t("loading") || "Loading..."}</div>
          ) : publicBoards.length === 0 ? (
            <Empty>
              <EmptyContent>
                <EmptyMedia>
                  <PresentationIcon />
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle>{t("noPublicBoards")}</EmptyTitle>
                  <EmptyDescription>This user hasn&apos;t shared any public boards yet</EmptyDescription>
                </EmptyHeader>
              </EmptyContent>
            </Empty>
          ) : (
            <ItemGroup>
              {publicBoards.map((board) => (
                <Item
                  key={board.id}
                  asChild
                  variant="outline"
                  className="group rounded-lg border-border/70 bg-background px-4 py-3 transition-colors hover:bg-muted/40"
                >
                  <Link href={`/board/${board.slug}`}>
                    <ItemContent>
                      <ItemTitle>{board.name}</ItemTitle>
                      {board.description && <ItemDescription>{board.description}</ItemDescription>}
                    </ItemContent>
                    <ChevronRightIcon className="size-4 text-muted-foreground shrink-0" />
                  </Link>
                </Item>
              ))}
            </ItemGroup>
          )}
        </div>
      </div>
    </main>
  );
}
