"use client";

import { RequestResponse } from "../services/requestService";
import { UpvoteButton } from "@/features/votes/components/UpvoteButton";
import { RequestHeader } from "@/features/requests/components/RequestHeader";
import { cn } from "@/shared/lib/utils";
import { useLocale, useTranslations } from "next-intl";
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
import { CheckCircle2, Circle, CircleDot, Clock3, Copy, XCircle, CalendarDays, Maximize2 } from "lucide-react";
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
  const requestDateLabel = request.createdAt
    ? new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }).format(new Date(request.createdAt))
    : "";
  const badgeBaseClass =
    "inline-flex h-6 items-center rounded-full border px-2.5 text-[10px] font-semibold leading-none";

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
      case "open":
        return "border-muted-foreground/35 bg-muted/45 text-muted-foreground";
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

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return <CircleDot aria-hidden="true" strokeWidth={2.5} />;
      case "planned":
        return <Circle aria-hidden="true" strokeWidth={2.5} />;
      case "in_progress":
        return <Clock3 aria-hidden="true" strokeWidth={2.5} />;
      case "completed":
        return <CheckCircle2 aria-hidden="true" strokeWidth={2.5} />;
      case "rejected":
        return <XCircle aria-hidden="true" strokeWidth={2.5} />;
      default:
        return <Circle aria-hidden="true" strokeWidth={2.5} />;
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
          <div className="min-w-0">
            <div className="mb-2 flex min-w-0 items-start justify-between gap-3">
              <h3 className="min-w-0 flex-1 truncate text-lg font-semibold tracking-tight">{request.title}</h3>

              <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                <UpvoteButton
                  requestId={request.id}
                  boardId={request.boardId}
                  initialVoteCount={request.voteCount ?? 0}
                />
              </div>
            </div>

            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  badgeBaseClass,
                  "gap-1.5 uppercase tracking-[0.08em]",
                  "[&_svg]:size-2.5 [&_svg]:shrink-0",
                  getStatusColor(request.status)
                )}
              >
                {getStatusIcon(request.status)}
                {getStatusLabel(request.status)}
              </span>
              {requestDateLabel ? (
                <span
                  className={cn(
                    badgeBaseClass,
                    "gap-1.5 border-border/70 bg-muted/40 text-muted-foreground",
                    "tracking-[0.04em] [&_svg]:size-2.5 [&_svg]:shrink-0"
                  )}
                >
                  <CalendarDays aria-hidden="true" strokeWidth={2} />
                  {requestDateLabel}
                </span>
              ) : null}
            </div>

            <p className="line-clamp-2 wrap-anywhere text-sm leading-6 text-muted-foreground">{request.description}</p>
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
        <DialogHeader className="shrink-0 px-6 py-4 pr-28">
          <DialogTitle className="sr-only">{request.title}</DialogTitle>
          <RequestHeader
            variant="dialog"
            requestId={request.id}
            boardId={request.boardId}
            title={request.title}
            description={request.description}
            status={request.status}
            createdAt={request.createdAt}
            initialVoteCount={request.voteCount ?? 0}
            showDescription={false}
            stopPropagation
          />
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
