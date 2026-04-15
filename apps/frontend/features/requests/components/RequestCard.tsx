"use client";

import { RequestResponse } from "../services/requestService";
import { UpvoteButton } from "@/features/votes/components/UpvoteButton";
import { Badge } from "@/shared/components/ui/badge";
import { useLocale, useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog";
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
  const t = useTranslations("RequestCard");
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const requestDateLabel = request.createdAt ? new Date(request.createdAt).toLocaleDateString(locale) : "";

  const getStatusLabel = (status: string) => {
    const normalized = status.toLowerCase();
    switch (normalized) {
      case "planned":
      case "in_progress":
      case "completed":
      case "rejected":
        return t(`status.${normalized}`);
      default:
        return status.replace("_", " ");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "planned":
        return "border-primary/35 bg-primary/10 text-primary";
      case "in_progress":
        return "border-chart-2/35 bg-chart-2/12 text-chart-2";
      case "completed":
        return "border-chart-1/35 bg-chart-1/12 text-chart-1";
      case "rejected":
        return "border-destructive/35 bg-destructive/10 text-destructive";
      default:
        return "";
    }
  };

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
        <article className="cursor-pointer rounded-lg border border-border/70 px-4 py-3 transition-colors hover:bg-muted/35">
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
            <div className="mt-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
              <UpvoteButton
                requestId={request.id}
                boardId={request.boardId}
                initialVoteCount={request.voteCount ?? 0}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-2 flex min-w-0 items-center gap-2">
                <h3 className="min-w-0 flex-1 truncate text-lg font-semibold tracking-tight">{request.title}</h3>
                <Badge variant="outline" className={getStatusColor(request.status)}>
                  {getStatusLabel(request.status)}
                </Badge>
                {requestDateLabel ? <span className="text-xs text-muted-foreground">{requestDateLabel}</span> : null}
              </div>

              <p className="line-clamp-2 wrap-anywhere text-sm leading-6 text-muted-foreground">
                {request.description}
              </p>
            </div>
          </div>
        </article>
      </DialogTrigger>

      <DialogContent
        className="w-[96vw] max-h-[90vh] max-w-[96vw] gap-0 overflow-hidden rounded-xl border border-border/70 bg-card p-0 sm:max-w-5xl"
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
        <DialogHeader className="shrink-0 px-6 py-5 pr-28">
          <div className="flex items-start gap-3">
            <div className="shrink-0">
              <UpvoteButton
                requestId={request.id}
                boardId={request.boardId}
                initialVoteCount={request.voteCount ?? 0}
              />
            </div>

            <div className="min-w-0 flex-1">
              <DialogTitle className="text-2xl tracking-tight">{request.title}</DialogTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getStatusColor(request.status)}>
                  {getStatusLabel(request.status)}
                </Badge>
                {requestDateLabel ? <span className="text-xs text-muted-foreground">{requestDateLabel}</span> : null}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex-none max-h-[36vh] overflow-y-auto px-6 py-5">
            <div className="whitespace-pre-wrap wrap-anywhere text-sm leading-relaxed text-foreground/90">
              {request.description}
            </div>
          </div>

          <Separator className="shrink-0" />

          <div className="min-h-0 flex-1 bg-muted/25 px-6 py-4">
            <CommentSection requestId={request.id} boardId={request.boardId} isDialog />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
