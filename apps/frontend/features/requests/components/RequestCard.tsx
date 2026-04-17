"use client";

import { RequestResponse } from "../services/requestService";
import { RequestHeader, RequestTitle } from "@/features/requests/components/RequestHeader";
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
import { useState } from "react";
import { CommentSection } from "@/features/comments/components/CommentSection";

interface RequestCardProps {
  request: RequestResponse;
  boardSlug: string;
}

export function RequestCard({ request, boardSlug }: RequestCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleCopyLink = async () => {
    const currentUrl = window.location.href.replace(/\/$/, "");
    const shareUrl = `${currentUrl}/request/${request.id}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Could not copy link");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex w-full flex-col rounded-lg border border-border/70 px-4 py-3 text-left transition-colors hover:bg-muted/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
        >
          <div className="min-w-0">
            <div className="mb-2 min-w-0">
              <h3 className="min-w-0 truncate text-lg font-semibold tracking-tight">{request.title}</h3>
            </div>

            <p className="line-clamp-2 wrap-anywhere text-sm leading-6 text-muted-foreground">{request.description}</p>

            <RequestMetadataRow
              request={request}
              boardId={request.boardId}
              stopPropagation
              size="sm"
              className="mt-2 mb-1"
            />
          </div>
        </button>
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
        <DialogHeader className="shrink-0 px-6 py-4 pr-28">
          <DialogTitle className="sr-only">{request.title}</DialogTitle>
          <RequestHeader variant="dialog">
            <RequestTitle as="h2" variant="dialog">
              {request.title}
            </RequestTitle>
          </RequestHeader>
          <DialogDescription className="sr-only">
            Request details and discussion thread for {request.title}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex-none max-h-[36vh] overflow-y-auto px-6 pt-1 pb-5">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Description
              </p>
              <div className="whitespace-pre-wrap wrap-anywhere text-sm leading-relaxed text-foreground/90">
                {request.description}
              </div>

              <RequestMetadataRow
                request={request}
                boardId={request.boardId}
                stopPropagation
                size="sm"
                className="mt-3"
              />
            </div>
          </div>

          <Separator className="shrink-0" />

          <div className="flex flex-col min-h-0 flex-1 bg-muted/25 px-6 py-4">
            <CommentSection requestId={request.id} boardId={request.boardId} isDialog />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
