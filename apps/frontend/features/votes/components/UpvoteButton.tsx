"use client";

import { useState, useEffect } from "react";
import { voteService } from "../services/voteService";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { toast } from "@/shared/components/ui/sonner";
import { decodeJwtPayload } from "@/shared/lib/jwt";
import { getAccessToken } from "@/shared/lib/apiClient";
import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { useChannel } from "@/shared/hooks/useChannel";

interface UpvoteButtonProps {
  requestId: string;
  boardId: string;
  initialVoteCount: number;
  className?: string;
}

export function UpvoteButton({ requestId, boardId, initialVoteCount, className }: UpvoteButtonProps) {
  const t = useTranslations("UpvoteButton");

  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteId, setVoteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    setVoteCount(initialVoteCount);
  }, [initialVoteCount]);

  const channelName = boardId ? `request.${boardId}` : null;

  useChannel<{
    requestId: string;
    boardId: string;
    voteId: string;
    userId: string;
    action: "created" | "deleted";
    voteCount: number | null;
  }>(channelName, (message) => {
    if (message.event !== "RequestUpdated" || message.payload.requestId !== requestId) {
      return;
    }

    setVoteCount(message.payload.voteCount ?? 0);

    if (message.payload.userId === currentUserId) {
      setHasVoted(message.payload.action === "created");
      setVoteId(message.payload.action === "created" ? message.payload.voteId : null);
    }
  });

  useEffect(() => {
    const checkInitialVoteStatus = async () => {
      const token = getAccessToken();
      if (!token) {
        setHasVoted(false);
        setVoteId(null);
        setCurrentUserId(null);
        return;
      }

      try {
        setIsLoading(true);
        const payload = decodeJwtPayload(token);
        const userId = payload?.userId || payload?.sub;
        if (!userId) {
          return;
        }

        setCurrentUserId(userId);

        const existingVoteId = await voteService.checkVote(requestId, userId, boardId);
        if (existingVoteId) {
          setHasVoted(true);
          setVoteId(existingVoteId);
        }
      } catch (error) {
        console.error("Error checking vote status", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkInitialVoteStatus();
  }, [requestId, boardId]);

  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) {
      return;
    }

    const previousVoteCount = voteCount;
    const previousHasVoted = hasVoted;
    const previousVoteId = voteId;
    setIsLoading(true);

    try {
      if (hasVoted && voteId) {
        setVoteCount((prev) => Math.max(prev - 1, 0));
        setHasVoted(false);

        await voteService.removeVote(voteId);
        setVoteId(null);
      } else {
        setVoteCount((prev) => prev + 1);
        setHasVoted(true);

        const newVoteId = await voteService.addVote(requestId, boardId);
        setVoteId(newVoteId);
      }
    } catch {
      setVoteCount(previousVoteCount);
      setHasVoted(previousHasVoted);
      setVoteId(previousVoteId);
      toast.error(getAccessToken() ? t("voteError") : t("mustLogin"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="xs"
      className={cn(
        "group/like h-auto rounded-full border px-2.5 py-1.5 shadow-xs transition-all duration-200 hover:cursor-pointer",
        "focus-visible:ring-2 focus-visible:ring-primary/30",
        hasVoted
          ? "border-rose-300/70 bg-rose-50 text-rose-700 dark:border-rose-400/30 dark:bg-rose-950/40 dark:text-rose-200"
          : "border-border/80 bg-background/70 text-muted-foreground hover:border-rose-200/80 hover:text-rose-700 dark:hover:border-rose-400/25 dark:hover:text-rose-200",
        className
      )}
      onClick={handleVote}
      disabled={isLoading}
      aria-pressed={hasVoted}
      aria-label={hasVoted ? "Remove like" : "Like request"}
    >
      <span className="flex items-center gap-1.5">
        <Heart
          className={cn(
            "size-3.5 transition-all duration-200",
            hasVoted ? "fill-current" : "group-hover/like:scale-110"
          )}
        />
        <span className="text-[11px] font-semibold tabular-nums leading-none">{voteCount}</span>
      </span>
    </Button>
  );
}
