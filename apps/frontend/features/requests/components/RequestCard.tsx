"use client";

import { useEffect, useMemo, useState } from "react";

import { RequestResponse, requestService, type UpdateRequestPayload } from "../services/requestService";
import { CategorySelectorMultiple } from "@/features/requests/components/CategorySelectorMultiple";
import { RequestDescription, RequestHeader, RequestTitle } from "@/features/requests/components/RequestHeader";
import { RequestMetadataRow } from "@/features/requests/components/RequestMetadataRow";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { Badge } from "@/shared/components/ui/badge";
import { Link } from "@/localization/i18n/routing";
import { Copy, Maximize2 } from "lucide-react";
import { toast } from "sonner";
import { RequestActivityTabs } from "@/features/requests/components/RequestActivityTabs";
import { getRequestCategoryIds } from "@/features/requests/services/requestService";

interface RequestCardProps {
  request: RequestResponse;
  boardSlug: string;
  currentUserId: string | null;
  isBoardAdmin: boolean;
}

export function RequestCard({ request, boardSlug, currentUserId, isBoardAdmin }: RequestCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editableRequest, setEditableRequest] = useState(request);
  const [changelogRefreshKey, setChangelogRefreshKey] = useState(0);

  useEffect(() => {
    setEditableRequest(request);
  }, [request]);

  const canEdit = useMemo(() => {
    if (!currentUserId) {
      return false;
    }

    return editableRequest.authorId === currentUserId || isBoardAdmin;
  }, [currentUserId, editableRequest.authorId, isBoardAdmin]);

  const categories = editableRequest.categories ?? [];
  const categoryIds = getRequestCategoryIds(editableRequest);

  const handleCopyLink = async () => {
    const currentUrl = window.location.href.replace(/\/$/, "");
    const shareUrl = `${currentUrl}/request/${editableRequest.id}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const handleUpdateRequest = async (payload: UpdateRequestPayload) => {
    const previousRequest = editableRequest;
    const nextRequest = { ...editableRequest, ...payload };

    setEditableRequest(nextRequest);

    try {
      const updatedRequest = await requestService.updateRequest(editableRequest.id, editableRequest.boardId, payload);

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
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <article className="flex w-full flex-col rounded-lg border border-border/70 px-4 py-3 text-left transition-colors hover:bg-muted/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2">
          <div className="min-w-0">
            <div className="min-w-0">
              <h3 className="min-w-0 truncate text-lg font-semibold tracking-tight">{editableRequest.title}</h3>
            </div>

            <p className="line-clamp-2 wrap-anywhere text-sm leading-6 text-muted-foreground">
              {editableRequest.description}
            </p>

            {categories.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {categories.map((category) => (
                  <Badge key={category.id} variant="outline" className="gap-1.5 border-border/70 bg-background/60">
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: category.hexColor }}
                      aria-hidden="true"
                    />
                    <span className="max-w-40 truncate">{category.name}</span>
                  </Badge>
                ))}
              </div>
            ) : null}

            <RequestMetadataRow
              request={editableRequest}
              boardId={editableRequest.boardId}
              stopPropagation
              canEdit={canEdit}
              canManageStatus={isBoardAdmin}
              onStatusSave={(nextStatus) => handleUpdateRequest({ status: nextStatus })}
              size="sm"
              className="mt-2 mb-1"
            />
          </div>
        </article>
      </DialogTrigger>

      <DialogContent
        onOpenAutoFocus={(event) => {
          event.preventDefault();
        }}
        className="flex flex-col w-[96vw] max-h-[90dvh] max-w-[96vw] gap-0 overflow-hidden rounded-xl border border-border/70 bg-card p-0 sm:max-w-5xl"
        topRightActions={
          <>
            <Button variant="ghost" size="icon-sm" onClick={handleCopyLink} aria-label="Copy request link">
              <Copy />
              <span className="sr-only">Copy Link</span>
            </Button>
            <Button asChild variant="ghost" size="icon-sm">
              <Link href={`/board/${boardSlug}/request/${request.id}`} aria-label="Open request full page">
                <Maximize2 />
                <span className="sr-only">Open Full Page</span>
              </Link>
            </Button>
          </>
        }
      >
        <DialogHeader className="shrink-0 px-6 pt-4 pb-4">
          <DialogTitle className="sr-only">{editableRequest.title}</DialogTitle>
          <RequestHeader
            variant="dialog"
            canEdit={canEdit}
            authorDisplayName={editableRequest.authorDisplayName}
            authorAvatarUrl={editableRequest.authorAvatarUrl}
            authorUsername={editableRequest.authorUsername}
            authorIsActive={editableRequest.authorIsActive}
          >
            <RequestTitle
              as="h2"
              variant="dialog"
              canEdit={canEdit}
              onSave={(nextTitle) => handleUpdateRequest({ title: nextTitle })}
            >
              {editableRequest.title}
            </RequestTitle>
          </RequestHeader>
          <DialogDescription className="sr-only">
            Request details and discussion thread for {editableRequest.title}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex-none max-h-[36vh] overflow-y-auto px-6 pt-1 pb-5">
            <div>
              <RequestDescription
                className="mt-0"
                contentClassName="text-sm leading-relaxed text-foreground/90"
                canEdit={canEdit}
                onSave={(nextDescription) => handleUpdateRequest({ description: nextDescription })}
              >
                {editableRequest.description ?? ""}
              </RequestDescription>

              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Categories</p>
                <CategorySelectorMultiple
                  boardId={editableRequest.boardId}
                  value={categoryIds}
                  onChange={(nextValues) => handleUpdateRequest({ categoryIds: nextValues })}
                  disabled={!canEdit}
                  canCreateCategory={isBoardAdmin}
                />
              </div>

              <RequestMetadataRow
                request={editableRequest}
                boardId={editableRequest.boardId}
                stopPropagation
                canEdit={canEdit}
                canManageStatus={isBoardAdmin}
                onStatusSave={(nextStatus) => handleUpdateRequest({ status: nextStatus })}
                size="sm"
                className="mt-5"
              />
            </div>
          </div>

          <Separator className="shrink-0" />
          <div className="flex min-h-0 flex-1 bg-muted/25 px-6 py-4">
            <RequestActivityTabs
              requestId={editableRequest.id}
              boardId={editableRequest.boardId}
              refreshToken={changelogRefreshKey}
              isDialog
              className="flex min-h-0 flex-1 flex-col"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
