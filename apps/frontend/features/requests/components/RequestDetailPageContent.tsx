"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useRouter } from "@/localization/i18n/routing";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Spinner } from "@/shared/components/ui/spinner";
import { RequestActivityTabs } from "@/features/requests/components/RequestActivityTabs";

const sectionLabelClassName = "text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground";

interface RequestDetailPageContentProps {
  slug: string;
  id: string;
}

export function RequestDetailPageContent({ slug, id }: RequestDetailPageContentProps) {
  const t = useTranslations("RequestDetailPage");
  const router = useRouter();
  const { user } = useAuth();
  const { board, request, loading, notFound } = useRequestDetailPage(slug, id);
  const [editableRequest, setEditableRequest] = useState<RequestResponse | null>(null);
  const [changelogRefreshKey, setChangelogRefreshKey] = useState(0);
  const [canManageBoard, setCanManageBoard] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setEditableRequest(request);
  }, [request]);

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

  const canDelete = useMemo(() => {
    if (!user || !board || !editableRequest) {
      return false;
    }

    return editableRequest.authorId === user.id || board.ownerId === user.id || canManageBoard;
  }, [board, canManageBoard, editableRequest, user]);

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

    setEditableRequest(nextRequest);

    try {
      const updatedRequest = await requestService.updateRequest(editableRequest.id, board.id, payload);

      const updatedCategoryIds = getRequestCategoryIds(updatedRequest);
      const nextCategoryIds = getRequestCategoryIds(nextRequest);
      const shouldKeepOptimisticCategoryIds =
        payload.categoryIds !== undefined &&
        updatedRequest.categoryIds === undefined &&
        (!updatedRequest.categories || updatedRequest.categories.length === 0);

      setEditableRequest({
        ...updatedRequest,
        categoryIds: shouldKeepOptimisticCategoryIds ? nextCategoryIds : updatedCategoryIds
      });
      setChangelogRefreshKey((currentValue) => currentValue + 1);
    } catch {
      setEditableRequest(previousRequest);
      toast.error("Could not save request changes");
      throw new Error("Could not save request changes");
    }
  };

  const handleDeleteRequest = async () => {
    if (!editableRequest) {
      return;
    }

    setIsDeleting(true);

    try {
      await requestService.deleteRequest(editableRequest.id);
      toast.success(t("deleteDialog.success"));
      router.replace(`/board/${slug}`);
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
            actions={
              canDelete ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm">
                      <MoreHorizontal className="size-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setIsDeleteDialogOpen(true)}
                    >
                      <Trash2 className="size-4" />
                      {t("actions.delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null
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
            <div className="mt-5 space-y-3">
              <p className={sectionLabelClassName}>Categories</p>
              <CategorySelectorMultiple
                boardId={board.id}
                value={categoryIds}
                onChange={(nextValues) => handleUpdateRequest({ categoryIds: nextValues })}
                disabled={!canEdit}
              />
            </div>
            <RequestMetadataRow
              request={editableRequest}
              boardId={board.id}
              canEdit={canEdit}
              onStatusSave={(nextStatus) => handleUpdateRequest({ status: nextStatus })}
              size="md"
              className="mt-5"
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
