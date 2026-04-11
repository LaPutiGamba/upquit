"use client";

import { useState, useEffect } from "react";
import { voteService } from "../services/voteService";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { toast } from "@/shared/components/ui/sonner";
import { decodeJwtPayload } from "@/shared/lib/jwt";
import { ArrowUp } from "lucide-react";
import { useTranslations } from "next-intl";

interface UpvoteButtonProps {
  requestId: string;
  boardId: string;
  initialVoteCount: number;
}

export function UpvoteButton({ requestId, boardId, initialVoteCount }: UpvoteButtonProps) {
  const t = useTranslations("UpvoteButton");

  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteId, setVoteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkInitialVoteStatus = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        return;
      }

      try {
        setIsLoading(true);
        const payload = decodeJwtPayload(token);
        const userId = payload?.userId || payload?.sub;
        if (!userId) {
          return;
        }

        const existingVoteId = await voteService.checkVote(requestId, userId, token);
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
  }, [requestId]);

  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error(t("mustLogin"));
      return;
    }

    setIsLoading(true);

    try {
      if (hasVoted && voteId) {
        setVoteCount((prev) => prev - 1);
        setHasVoted(false);

        await voteService.removeVote(voteId, token);
        setVoteId(null);
      } else {
        setVoteCount((prev) => prev + 1);
        setHasVoted(true);

        const newVoteId = await voteService.addVote(requestId, boardId, token);
        setVoteId(newVoteId);
      }
    } catch {
      setVoteCount((prev) => (hasVoted ? prev + 1 : prev - 1));
      setHasVoted(hasVoted);
      toast.error(t("voteError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={hasVoted ? "default" : "outline"}
      size="sm"
      className={cn(
        "flex flex-col hover:cursor-pointer items-center gap-1 h-auto py-2 px-3 min-w-[3.5rem]",
        hasVoted ? "bg-primary text-primary-foreground" : "text-muted-foreground"
      )}
      onClick={handleVote}
      disabled={isLoading}
    >
      <ArrowUp className={cn("h-4 w-4 transition-transform", hasVoted && "transform -translate-y-0.5")} />
      <span className="text-xs font-semibold">{voteCount}</span>
    </Button>
  );
}
