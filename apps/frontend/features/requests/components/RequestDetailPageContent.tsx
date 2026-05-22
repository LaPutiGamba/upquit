"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, Loader2, Trash2 } from "lucide-react";

import { boardService } from "@/features/boards/services/boardService";
import { useRequestDetailPage } from "@/features/requests/hooks/useRequestDetailPage";

import { CategorySelectorMultiple } from "@/features/requests/components/CategorySelectorMultiple";
import { RequestDescription, RequestHeader, RequestTitle } from "@/features/requests/components/RequestHeader";
import { RequestMetadataRow } from "@/features/requests/components/RequestMetadataRow";
import {
  requestService,
  getRequestCategoryIds,
  type RequestResponse,
  type UpdateRequestPayload
} from "@/features/requests/services/requestService";
import { useAuth } from "@/shared/components/AuthProvider";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/shared/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { Spinner } from "@/shared/components/ui/spinner";
import { RequestActivityTabs } from "@/features/requests/components/RequestActivityTabs";
import { useChannel, type IncomingBroadcastMessage } from "@/shared/hooks/useChannel";
import { unwrapBroadcastPayload } from "@/shared/lib/realtime";

const sectionLabelClassName = "text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground";

interface RequestDetailPageContentProps {
  slug: string;
  id: string;
}

export function RequestDetailPageContent({ slug, id }: RequestDetailPageContentProps) {
  const t = useTranslations("RequestDetailPage");
  const { user } = useAuth();
  const { board, request, loading, notFound } = useRequestDetailPage(slug, id);
  const [optimisticRequest, setOptimisticRequest] = useState<RequestResponse | null>(null);
  const [changelogRefreshKey, setChangelogRefreshKey] = useState(0);
  const [canManageBoard, setCanManageBoard] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(false);
  const [isSubscriptionSaving, setIsSubscriptionSaving] = useState(false);

  const editableRequest = useMemo(() => {
    if (!request) {
      return optimisticRequest;
    }

    if (!optimisticRequest) {
      return request;
    }

    return optimisticRequest.id === request.id ? optimisticRequest : request;
  }, [optimisticRequest, request]);

  type RequestUpdatedPayload = {
    boardId: string;
    request: RequestResponse;
  };

  useChannel<RequestUpdatedPayload>(
    board ? `request.${board.id}` : null,
    (message: IncomingBroadcastMessage<RequestUpdatedPayload>) => {
      if (message.event !== "RequestUpdated") {
        return;
      }

      if (!editableRequest) {
        return;
      }

      const payload = unwrapBroadcastPayload(message.payload);

      if (payload.boardId !== board?.id || payload.request.id !== editableRequest.id) {
        return;
      }

      setOptimisticRequest(payload.request);
      setChangelogRefreshKey((currentValue) => currentValue + 1);
    }
  );

  useEffect(() => {
    let cancelled = false;

    const loadBoardPermissions = async () => {
      if (!board || !user?.id) {
        setCanManageBoard(false);
        return;
      }

      try {
        const members = await boardService.getBoardMembers(board.id);

        if (cancelled) {
          return;
        }

        setCanManageBoard(members.some((member) => member.userId === user.id && member.role === "admin"));
      } catch {
        if (!cancelled) {
          setCanManageBoard(false);
        }
      }
    };

    void loadBoardPermissions();

    return () => {
      cancelled = true;
    };
  }, [board, user?.id]);

  const canEdit = useMemo(() => {
    if (!user || !board || !editableRequest) {
      return false;
    }

    return editableRequest.authorId === user.id || board.ownerId === user.id;
  }, [board, editableRequest, user]);

  const canManageStatus = useMemo(() => {
    if (!user || !board) {
      return false;
    }

    return board.ownerId === user.id || canManageBoard;
  }, [board, canManageBoard, user]);

  const canDelete = useMemo(() => {
    if (!user || !board || !editableRequest) {
      return false;
    }

    return editableRequest.authorId === user.id || board.ownerId === user.id || canManageBoard;
  }, [board, canManageBoard, editableRequest, user]);

  const canWatchRequest = useMemo(() => {
    if (!user || !editableRequest) {
      return false;
    }

    return editableRequest.authorId !== user.id;
  }, [editableRequest, user]);

  const categoryIds = useMemo(
    () => getRequestCategoryIds(editableRequest ?? { categoryIds: [], categories: [] }),
    [editableRequest]
  );

  const handleUpdateRequest = async (payload: UpdateRequestPayload) => {
    if (!board || !editableRequest) {
      return;
    }

    const previousRequest = editableRequest;
    const nextRequest = { ...editableRequest, ...payload };

    setOptimisticRequest(nextRequest);

    try {
      const updatedRequest = await requestService.updateRequest(editableRequest.id, board.id, payload);

      const updatedCategoryIds = getRequestCategoryIds(updatedRequest);
      const nextCategoryIds = getRequestCategoryIds(nextRequest);
      const shouldKeepOptimisticCategoryIds =
        payload.categoryIds !== undefined &&
        updatedRequest.categoryIds === undefined &&
        (!updatedRequest.categories || updatedRequest.categories.length === 0);

      setOptimisticRequest({
        ...updatedRequest,
        categoryIds: shouldKeepOptimisticCategoryIds ? nextCategoryIds : updatedCategoryIds
      });
      setChangelogRefreshKey((currentValue) => currentValue + 1);
    } catch {
      setOptimisticRequest(previousRequest);
      toast.error("Could not save request changes");
    }
  };

  useEffect(() => {
    if (!board || !editableRequest || !canWatchRequest) {
      setIsSubscribed(false);
      return;
    }

    let cancelled = false;

    const loadSubscriptionState = async () => {
      setIsSubscriptionLoading(true);

      try {
        const subscribed = await requestService.isSubscribedToRequest(editableRequest.id, board.id);

        if (!cancelled) {
          setIsSubscribed(subscribed);
        }
      } catch {
        if (!cancelled) {
          setIsSubscribed(false);
        }
      } finally {
        if (!cancelled) {
          setIsSubscriptionLoading(false);
        }
      }
    };

    void loadSubscriptionState();

    return () => {
      cancelled = true;
    };
  }, [board, canWatchRequest, editableRequest]);

  const handleToggleSubscription = async () => {
    if (!board || !editableRequest || !canWatchRequest || isSubscriptionLoading || isSubscriptionSaving) {
      return;
    }

    const previousSubscribed = isSubscribed;
    setIsSubscriptionSaving(true);
    setIsSubscribed(!previousSubscribed);

    try {
      if (previousSubscribed) {
        await requestService.unsubscribeFromRequest(editableRequest.id, board.id);
        toast.success("You are no longer watching this request");
      } else {
        await requestService.subscribeToRequest(editableRequest.id, board.id);
        toast.success("You are now watching this request");
      }
    } catch {
      setIsSubscribed(previousSubscribed);
      toast.error("Could not update watch status");
    } finally {
      setIsSubscriptionSaving(false);
    }
  };

  const handleDeleteRequest = async () => {
    if (!editableRequest) {
      toast.error(t("deleteDialog.failed"));
      return;
    }

    setIsDeleting(true);

    try {
      await requestService.deleteRequest(editableRequest.id);
      toast.success(t("deleteDialog.success"));
      window.location.replace(`/board/${slug}`);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(t("deleteDialog.failed"));
      }
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <main className="container mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4">
        <Spinner className="size-12" />
      </main>
    );
  }

  if (notFound || !board || !editableRequest) {
    return (
      <main className="container mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4">
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">Request not found.</p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto flex max-w-6xl flex-1 flex-col px-4 py-8 md:py-10">
        <section className="pb-8">
          <RequestHeader
            variant="page"
            canEdit={canEdit}
            authorDisplayName={editableRequest.authorDisplayName}
            authorAvatarUrl={editableRequest.authorAvatarUrl}
            authorUsername={editableRequest.authorUsername}
            authorIsActive={editableRequest.authorIsActive}
            actions={
              <div className="flex items-center gap-1.5">
                {canWatchRequest ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={handleToggleSubscription}
                          aria-label={isSubscribed ? "Unwatch request" : "Watch request"}
                          disabled={isSubscriptionLoading || isSubscriptionSaving}
                        >
                          {isSubscriptionLoading || isSubscriptionSaving ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : isSubscribed ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        {isSubscribed ? "Unwatch request" : "Watch request"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : null}

                {canDelete ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="destructive"
                          size="icon-sm"
                          onClick={() => setIsDeleteDialogOpen(true)}
                          aria-label={t("actions.delete")}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">{t("actions.delete")}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : null}
              </div>
            }
          >
            <RequestTitle
              variant="page"
              as="h1"
              canEdit={canEdit}
              onSave={(nextTitle) => handleUpdateRequest({ title: nextTitle })}
            >
              {editableRequest.title}
            </RequestTitle>
            <RequestDescription
              canEdit={canEdit}
              onSave={(nextDescription) => handleUpdateRequest({ description: nextDescription })}
            >
              {editableRequest.description ?? ""}
            </RequestDescription>
            <div className="mt-4 space-y-3">
              <p className={sectionLabelClassName}>Categories</p>
              <CategorySelectorMultiple
                boardId={board.id}
                value={categoryIds}
                onChange={(nextValues) => handleUpdateRequest({ categoryIds: nextValues })}
                disabled={!canEdit}
                canCreateCategory={Boolean(user && (board.ownerId === user.id || canManageBoard))}
              />
            </div>
            <RequestMetadataRow
              request={editableRequest}
              boardId={board.id}
              canEdit={canEdit}
              canManageStatus={canManageStatus}
              onStatusSave={(nextStatus) => handleUpdateRequest({ status: nextStatus })}
              size="md"
              className="mt-3"
            />
          </RequestHeader>

          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("deleteDialog.title")}</DialogTitle>
                <DialogDescription>{t("deleteDialog.description")}</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  {t("deleteDialog.actions.cancel")}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => void handleDeleteRequest()}
                  disabled={isDeleting}
                >
                  {isDeleting ? t("deleteDialog.actions.confirming") : t("deleteDialog.actions.confirmDelete")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </section>

        <section>
          <RequestActivityTabs
            requestId={editableRequest.id}
            boardId={board.id}
            refreshToken={changelogRefreshKey}
            className="mt-4 flex h-[66vh] min-h-90 flex-col min-w-0 overflow-hidden"
          />
        </section>
      </main>
    </div>
  );
}
