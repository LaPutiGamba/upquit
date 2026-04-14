"use client";

import { RequestResponse } from "../services/requestService";
import { UpvoteButton } from "@/features/votes/components/UpvoteButton";
import { Card, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
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
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
      case "in_progress":
        return "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20";
      case "completed":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case "rejected":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const handleCopyLink = () => {
    const currentUrl = window.location.href.replace(/\/$/, "");
    const shareUrl = `${currentUrl}/request/${request.id}`;

    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer border border-border/65 bg-background py-4 shadow-none transition-colors hover:bg-accent/35">
          <div className="flex flex-row items-start gap-4 px-4 text-left">
            <div className="shrink-0 mt-1" onClick={(e) => e.stopPropagation()}>
              <UpvoteButton
                requestId={request.id}
                boardId={request.boardId}
                initialVoteCount={request.voteCount ?? 0}
              />
            </div>

            <div className="flex grow flex-col gap-2">
              <div className="flex justify-between items-start gap-4">
                <CardTitle className="text-xl leading-tight m-0">{request.title}</CardTitle>
                <div className="flex items-center gap-2">
                  {requestDateLabel && <span className="text-xs text-muted-foreground">{requestDateLabel}</span>}
                  <Badge variant="outline" className={getStatusColor(request.status)}>
                    {getStatusLabel(request.status)}
                  </Badge>
                </div>
              </div>
              <p className="text-muted-foreground line-clamp-2 text-sm">{request.description}</p>
            </div>
          </div>
        </Card>
      </DialogTrigger>

      <DialogContent
        className="w-[96vw] max-w-[96vw]! max-h-[90vh] overflow-hidden rounded-xl border flex flex-col gap-0 p-0 sm:max-w-5xl! lg:max-w-5xl!"
        topRightActions={
          <>
            <Button variant="ghost" size="icon-sm" onClick={handleCopyLink} aria-label="Copy request link">
              <Copy size={14} />
              <span className="sr-only">Copy Link</span>
            </Button>
            <Button asChild variant="ghost" size="icon-sm">
              <Link href={`/board/${boardSlug}/request/${request.id}`} aria-label="Open request full page">
                <Maximize2 size={14} />
                <span className="sr-only">Open Full Page</span>
              </Link>
            </Button>
          </>
        }
      >
        <DialogHeader className="flex flex-row items-start gap-4 border-b px-6 py-4 pr-28 shrink-0">
          <div className="shrink-0 mt-1">
            <UpvoteButton requestId={request.id} boardId={request.boardId} initialVoteCount={request.voteCount ?? 0} />
          </div>
          <div className="flex flex-col gap-2">
            <DialogTitle className="text-2xl">{request.title}</DialogTitle>
            <DialogDescription>Review request details, vote, and join the discussion.</DialogDescription>
            <div className="flex gap-2 items-center">
              <Badge variant="outline" className={getStatusColor(request.status)}>
                {getStatusLabel(request.status)}
              </Badge>
              <span className="text-xs text-muted-foreground">{requestDateLabel}</span>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
          <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">{request.description}</div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col border-t bg-muted/25 px-6 py-4">
          <CommentSection requestId={request.id} boardId={request.boardId} isDialog />
        </div>
      </DialogContent>
    </Dialog>
  );
}
