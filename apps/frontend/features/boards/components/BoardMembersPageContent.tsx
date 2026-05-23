"use client";

import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { redirect } from "next/navigation";
import { UserPlus2, Trash2, Shield, Crown, Search } from "lucide-react";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/shared/components/ui/dialog";
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
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);

  const [board, setBoard] = useState<BoardResponse | null>(null);
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [email, setEmail] = useState("");
  const [pendingMemberId, setPendingMemberId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [canManageBoard, setCanManageBoard] = useState(false);
  const [memberFilters, setMemberFilters] = useState<{ role?: "admin" | "member"; search?: string }>({});
  const [searchInput, setSearchInput] = useState("");
  const [memberToRemove, setMemberToRemove] = useState<BoardMember | null>(null);

  const isBoardOwner = Boolean(user?.id && board?.ownerId && user.id === board.ownerId);
  const isLimitedAdmin = canManageBoard && !isBoardOwner;

  const sortedMembers = useMemo(() => {
    return members.toSorted((leftMember, rightMember) => {
      if (leftMember.userId === board?.ownerId) return -1;
      if (rightMember.userId === board?.ownerId) return 1;

      const leftLabel = leftMember.displayName || leftMember.email;
      const rightLabel = rightMember.displayName || rightMember.email;

      return leftLabel.localeCompare(rightLabel);
    });
  }, [board?.ownerId, members]);

  const loadMembers = useCallback(async (boardId: string, filters?: { role?: "admin" | "member"; search?: string }) => {
    const nextMembers = await boardService.getBoardMembers(boardId, filters);
    setMembers(nextMembers);
    return nextMembers;
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadBoardMembers = async () => {
      setIsLoading(true);
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
          redirect("/login");
          return;
        }

        setNotFound(true);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadBoardMembers();

    return () => {
      cancelled = true;
    };
  }, [slug, user?.id, loadMembers]);

  useEffect(() => {
    if (!board) return;

    const timeout = setTimeout(() => {
      void loadMembers(board.id, { ...memberFilters, search: searchInput || undefined });
    }, 250);

    return () => clearTimeout(timeout);
  }, [board, memberFilters, searchInput, loadMembers]);

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

    if (isLimitedAdmin && nextRole === "admin") {
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

    if (isLimitedAdmin && member.role === "admin") {
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

  const confirmRemoveMember = async () => {
    if (!memberToRemove) {
      return;
    }

    const nextMember = memberToRemove;
    setMemberToRemove(null);
    await handleRemoveMember(nextMember);
  };

  const activeFilterCount = [memberFilters.role, memberFilters.search].filter(Boolean).length;

  if (isLoading) {
    return null;
  }

  if (notFound || !board) {
    return (
      <main className="h-full bg-background">
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
      <main className="h-full bg-background">
        <div className="mx-auto flex min-h-svh w-full max-w-6xl items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-md rounded-xl border border-dashed bg-card p-8 text-center">
            <p className="text-muted-foreground">{t("forbidden")}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="h-full bg-background">
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight">{t("members.title")}</h2>
              <Badge variant="outline">{sortedMembers.length}</Badge>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {activeFilterCount} active
                </Badge>
              )}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9 h-8 w-full sm:w-56"
                  placeholder="Search members..."
                />
              </div>

              <Select
                value={memberFilters.role ?? "all"}
                onValueChange={(v) =>
                  setMemberFilters((f) => ({ ...f, role: v === "all" ? undefined : (v as "admin" | "member") }))
                }
              >
                <SelectTrigger className="h-8 w-full sm:w-32">
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                  <SelectItem value="member">Members</SelectItem>
                </SelectContent>
              </Select>
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
                const isPending = pendingMemberId === member.userId;
                const canEditRole =
                  !isCurrentUser && !isPending && !isSubmitting && (isBoardOwner || member.role === "admin");
                const canRemoveMember =
                  !isOwner &&
                  !isCurrentUser &&
                  !isPending &&
                  !isSubmitting &&
                  (!isLimitedAdmin || member.role !== "admin");
                const roleLabel = isOwner
                  ? t("roles.owner")
                  : member.role === "admin"
                    ? t("roles.admin")
                    : t("roles.member");

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

                      <div className="flex flex-col sm:flex-row sm:items-end">
                        {isOwner ? null : (
                          <div className="flex min-w-36 flex-col gap-1">
                            <span className="text-xs font-medium text-muted-foreground">{t("members.role")}</span>
                            <Select
                              value={member.role}
                              onValueChange={(nextRole) => {
                                void handleUpdateMemberRole(member, nextRole as BoardMemberRole);
                              }}
                              disabled={!canEditRole}
                            >
                              <SelectTrigger className="h-8 w-full text-xs sm:w-32">
                                <SelectValue placeholder={t("members.role")} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="member">{t("roles.member")}</SelectItem>
                                <SelectItem value="admin" disabled={!isBoardOwner}>
                                  {t("roles.admin")}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {canRemoveMember ? (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="size-8 shrink-0"
                            onClick={() => setMemberToRemove(member)}
                            disabled={!canRemoveMember}
                            aria-label={t("members.remove")}
                          >
                            <Trash2 className="size-4" />
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

      <Dialog open={Boolean(memberToRemove)} onOpenChange={(open) => !open && setMemberToRemove(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("removeDialog.title")}</DialogTitle>
            <DialogDescription>
              {memberToRemove
                ? t("removeDialog.description", { name: memberToRemove.displayName || memberToRemove.email })
                : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setMemberToRemove(null)}>
              {t("removeDialog.cancel")}
            </Button>
            <Button type="button" variant="destructive" onClick={() => void confirmRemoveMember()}>
              {t("removeDialog.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
