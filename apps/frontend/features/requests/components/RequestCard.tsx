"use client";

import { useEffect, useMemo, useState } from "react";

import { RequestResponse, requestService, type UpdateRequestPayload } from "../services/requestService";
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
import { Link } from "@/localization/i18n/routing";
import { Copy, Maximize2 } from "lucide-react";
import { toast } from "sonner";
import { RequestActivityTabs } from "@/features/requests/components/RequestActivityTabs";

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

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.currentTarget.click();
    }
  };

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
      setEditableRequest(updatedRequest);
      setChangelogRefreshKey((currentValue) => currentValue + 1);
    } catch {
      setEditableRequest(previousRequest);
      toast.error("Could not save request changes");
      throw new Error("Could not save request changes");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <article
          role="button"
          tabIndex={0}
          onKeyDown={handleCardKeyDown}
          className="flex w-full flex-col rounded-lg border border-border/70 px-4 py-3 text-left transition-colors hover:bg-muted/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
        >
          <div className="min-w-0">
            <div className="min-w-0">
              <h3 className="min-w-0 truncate text-lg font-semibold tracking-tight">{editableRequest.title}</h3>
            </div>

            <p className="line-clamp-2 wrap-anywhere text-sm leading-6 text-muted-foreground">
              {editableRequest.description}
            </p>

            <RequestMetadataRow
              request={editableRequest}
              boardId={editableRequest.boardId}
              stopPropagation
              canEdit={canEdit}
              onStatusSave={(nextStatus) => handleUpdateRequest({ status: nextStatus })}
              size="sm"
              className="mt-2 mb-1"
            />
          </div>
        </article>
      </DialogTrigger>

      <DialogContent
        className="flex flex-col w-[96vw] max-h-[90vh] max-w-[96vw] gap-0 overflow-hidden rounded-xl border border-border/70 bg-card p-0 sm:max-w-5xl"
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
        <DialogHeader className="shrink-0 px-6 py-4 pr-35 sm:pr-38">
          <DialogTitle className="sr-only">{editableRequest.title}</DialogTitle>
          <RequestHeader variant="dialog" canEdit={canEdit}>
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

              <RequestMetadataRow
                request={editableRequest}
                boardId={editableRequest.boardId}
                stopPropagation
                canEdit={canEdit}
                onStatusSave={(nextStatus) => handleUpdateRequest({ status: nextStatus })}
                size="sm"
                className="mt-3"
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
