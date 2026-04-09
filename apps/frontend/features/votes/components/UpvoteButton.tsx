"use client";

import { useState, useEffect } from "react";
import { voteService } from "../services/voteService";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { toast } from "@/shared/components/ui/sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUp01Icon } from "@hugeicons/core-free-icons";

interface UpvoteButtonProps {
  requestId: string;
  boardId: string;
  initialVoteCount: number;
}

export function UpvoteButton({ requestId, boardId, initialVoteCount }: UpvoteButtonProps) {
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
        const payload = JSON.parse(atob(token.split(".")[1]));
        const userId = payload.id || payload.sub;

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
      toast.error("You must be logged in to vote.");
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
      toast.error("Could not register your vote. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={hasVoted ? "default" : "outline"}
      size="sm"
      className={cn(
        "flex flex-col items-center gap-1 h-auto py-2 px-3 min-w-[3.5rem]",
        hasVoted ? "bg-primary text-primary-foreground" : "text-muted-foreground"
      )}
      onClick={handleVote}
      disabled={isLoading}
    >
      <HugeiconsIcon
        icon={ArrowUp01Icon}
        size={16}
        className={cn("transition-transform", hasVoted && "transform -translate-y-0.5")}
      />
      <span className="text-xs font-semibold">{voteCount}</span>
    </Button>
  );
}
