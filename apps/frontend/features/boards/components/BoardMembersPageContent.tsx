"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/localization/i18n/routing";
import { UserPlus2, Trash2, Shield, Crown } from "lucide-react";

import {
  boardService,
  type BoardMember,
  type BoardMemberRole,
  type BoardResponse
} from "@/features/boards/services/boardService";
import { useAuth } from "@/shared/components/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/shared/components/ui/empty";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Separator } from "@/shared/components/ui/separator";
import { toast } from "@/shared/components/ui/sonner";
import { UnauthorizedError } from "@/shared/lib/apiClient";
import { getBoardFallbackLetter } from "@/shared/components/app-shell/utils";

interface BoardMembersPageContentProps {
  slug: string;
}

export function BoardMembersPageContent({ slug }: BoardMembersPageContentProps) {
  const t = useTranslations("BoardMembersPage");
  const router = useRouter();
  const { user } = useAuth();

  const [board, setBoard] = useState<BoardResponse | null>(null);
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [pendingMemberId, setPendingMemberId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [canManageBoard, setCanManageBoard] = useState(false);

  const sortedMembers = useMemo(() => {
    return [...members].sort((leftMember, rightMember) => {
      if (leftMember.userId === board?.ownerId) return -1;
      if (rightMember.userId === board?.ownerId) return 1;

      const leftLabel = leftMember.displayName || leftMember.email;
      const rightLabel = rightMember.displayName || rightMember.email;

      return leftLabel.localeCompare(rightLabel);
    });
  }, [board?.ownerId, members]);

  const loadMembers = async (boardId: string) => {
    const nextMembers = await boardService.getBoardMembers(boardId);
    setMembers(nextMembers);
    return nextMembers;
  };

  useEffect(() => {
    let cancelled = false;

    const loadBoardMembers = async () => {
      setLoading(true);
      setNotFound(false);

      try {
        const currentBoard = await boardService.getBoardBySlug(slug);

        if (cancelled) {
          return;
        }

        setBoard(currentBoard);

        const nextMembers = await loadMembers(currentBoard.id);

        if (cancelled) {
          return;
        }

        if (user?.id === currentBoard.ownerId) {
          setCanManageBoard(true);
        } else {
          setCanManageBoard(nextMembers.some((member) => member.userId === user?.id && member.role === "admin"));
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error instanceof UnauthorizedError) {
          router.replace("/login");
          return;
        }

        setNotFound(true);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadBoardMembers();

    return () => {
      cancelled = true;
    };
  }, [router, slug, user?.id]);

  const handleAddMember = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!board) {
      return;
    }

    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      toast.error(t("errors.emailRequired"));
      return;
    }

    setIsSubmitting(true);

    try {
      await boardService.addBoardMember(board.id, normalizedEmail);
      await loadMembers(board.id);
      setEmail("");
      toast.success(t("success.added"));
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(t("errors.addFailed"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMemberRole = async (member: BoardMember, nextRole: BoardMemberRole) => {
    if (!board || member.userId === board.ownerId || member.userId === user?.id || member.role === nextRole) {
      return;
    }

    setPendingMemberId(member.userId);

    try {
      await boardService.updateBoardMemberRole(board.id, member.userId, nextRole);
      await loadMembers(board.id);
      toast.success(t("success.roleUpdated", { name: member.displayName || member.email }));
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(t("errors.updateRoleFailed"));
      }
    } finally {
      setPendingMemberId(null);
    }
  };

  const handleRemoveMember = async (member: BoardMember) => {
    if (!board) {
      return;
    }

    setPendingMemberId(member.userId);

    try {
      await boardService.removeBoardMember(board.id, member.userId);
      await loadMembers(board.id);
      toast.success(t("success.removed", { name: member.displayName || member.email }));
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(t("errors.removeFailed"));
      }
    } finally {
      setPendingMemberId(null);
    }
  };

  if (loading) {
    return null;
  }

  if (notFound || !board) {
    return (
      <main className="min-h-svh bg-background">
        <div className="mx-auto flex min-h-svh w-full max-w-6xl items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-md rounded-xl border border-dashed bg-card p-8 text-center">
            <p className="text-muted-foreground">{t("notFound")}</p>
          </div>
        </div>
      </main>
    );
  }

  if (!canManageBoard) {
    return (
      <main className="min-h-svh bg-background">
        <div className="mx-auto flex min-h-svh w-full max-w-6xl items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-md rounded-xl border border-dashed bg-card p-8 text-center">
            <p className="text-muted-foreground">{t("forbidden")}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6 pb-10 md:p-8 md:pb-12">
        <section className="flex items-start justify-between gap-4 border-b border-border/70 pb-5">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="size-11 border border-border/80 md:size-12">
              {board.logoUrl && <AvatarImage src={board.logoUrl} alt={board.name} />}
              <AvatarFallback className="text-sm font-semibold">{getBoardFallbackLetter(board.name)}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col gap-1">
              <h1 className="truncate text-2xl font-semibold tracking-tight">{t("title")}</h1>
              <p className="text-sm text-muted-foreground">{t("description")}</p>
            </div>
          </div>
        </section>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>{t("invite.title")}</CardTitle>
            <CardDescription>{t("invite.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleAddMember}>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t("invite.placeholder")}
                autoComplete="email"
              />
              <Button type="submit" className="shrink-0" disabled={isSubmitting}>
                <UserPlus2 className="size-4" />
                {isSubmitting ? t("invite.adding") : t("invite.action")}
              </Button>
            </form>
          </CardContent>
        </Card>

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight">{t("members.title")}</h2>
              <Badge variant="outline">{sortedMembers.length}</Badge>
            </div>
          </div>

          {sortedMembers.length === 0 ? (
            <Empty className="rounded-xl border border-dashed py-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Shield className="size-5" aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>{t("members.emptyTitle")}</EmptyTitle>
                <EmptyDescription>{t("members.emptyDescription")}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
              {sortedMembers.map((member, index) => {
                const isOwner = member.userId === board.ownerId;
                const isCurrentUser = member.userId === user?.id;
                const roleLabel = isOwner
                  ? t("roles.owner")
                  : member.role === "admin"
                    ? t("roles.admin")
                    : t("roles.member");
                const isPending = pendingMemberId === member.userId;

                return (
                  <div key={member.userId}>
                    <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar className="size-10">
                          {member.avatarUrl ? <AvatarImage src={member.avatarUrl} alt={member.displayName} /> : null}
                          <AvatarFallback className="text-xs font-semibold">
                            {getBoardFallbackLetter(member.displayName || member.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate font-medium">{member.displayName}</p>
                            <Badge variant={isOwner ? "default" : member.role === "admin" ? "secondary" : "outline"}>
                              {isOwner ? <Crown className="size-3" /> : null}
                              {roleLabel}
                            </Badge>
                          </div>
                          <p className="truncate text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                        {isOwner ? null : (
                          <div className="flex min-w-36 flex-col gap-1">
                            <span className="text-xs font-medium text-muted-foreground">{t("members.role")}</span>
                            <Select
                              value={member.role}
                              onValueChange={(nextRole) => {
                                void handleUpdateMemberRole(member, nextRole as BoardMemberRole);
                              }}
                              disabled={isCurrentUser || isPending || isSubmitting}
                            >
                              <SelectTrigger className="h-8 w-full text-xs sm:w-32">
                                <SelectValue placeholder={t("members.role")} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="member">{t("roles.member")}</SelectItem>
                                <SelectItem value="admin">{t("roles.admin")}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {!isOwner && !isCurrentUser ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => void handleRemoveMember(member)}
                            disabled={isPending || isSubmitting}
                          >
                            <Trash2 className="size-4" />
                            {t("members.remove")}
                          </Button>
                        ) : null}
                      </div>
                    </div>
                    {index < sortedMembers.length - 1 ? <Separator /> : null}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
