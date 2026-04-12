"use client";

import { useEffect, useState } from "react";
import { giveToGetService, GiveToGetProgressResponse } from "../services/giveToGetService";
import { BoardResponse } from "@/features/boards/services/boardService";
import { Progress } from "@/shared/components/ui/progress";
import { Card, CardContent, CardTitle } from "@/shared/components/ui/card";
import { useChannel } from "@/shared/hooks/useChannel";
import { decodeJwtPayload } from "@/shared/lib/jwt";
import { useTranslations } from "next-intl";

interface GiveToGetTrackerProps {
  board: BoardResponse;
}

export function GiveToGetTracker({ board }: GiveToGetTrackerProps) {
  const t = useTranslations("GiveToGet");

  const [progress, setProgress] = useState<GiveToGetProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      const payload = decodeJwtPayload(token);
      const nextUserId = payload?.userId || payload?.sub;

      if (nextUserId) {
        setUserId(nextUserId);
        setIsAuthenticated(true);
      } else {
        console.error("Failed to parse token");
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!board.giveToGetEnabled || !userId) {
      setLoading(false);
      return;
    }

    const fetchProgress = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await giveToGetService.getProgress(board.id, token);
        setProgress(data);
      } catch (error) {
        const message = error instanceof Error ? error.message.toLowerCase() : "";
        const isNotFoundError = message.includes("not found");
        const isUnauthorized = message.includes("unauthorized") || message.includes("not authenticated");

        if (isNotFoundError) {
          try {
            const newData = await giveToGetService.createProgress(board.id, token);
            setProgress(newData);
          } catch (createError) {
            console.error("Failed to auto-create give-to-get progress", createError);
          }
        } else if (isUnauthorized) {
          setProgress(null);
        } else {
          console.error("Error fetching give-to-get progress", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [board.id, board.giveToGetEnabled, userId]);

  const channelName = userId ? `progress.${userId}.${board.id}` : null;

  useChannel<GiveToGetProgressResponse>(channelName, (message) => {
    if (message.event === "ProgressUpdated") {
      setProgress(message.payload);
    }
  });

  if (!board.giveToGetEnabled) return null;

  if (loading) return <div className="h-16 animate-pulse rounded-md bg-muted/60 w-full mb-4"></div>;

  if (!isAuthenticated) {
    return (
      <Card className="mb-4 border-border/60 bg-background shadow-none">
        <CardContent className="px-4 py-3">
          <CardTitle className="text-lg leading-none">{t("title")}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">{t("loginHint")}</p>
        </CardContent>
      </Card>
    );
  }

  if (!progress) return null;

  const votesReq = board.giveToGetVotesReq || 0;
  const commentsReq = board.giveToGetCommentsReq || 0;
  const votesGiven = progress.votesGiven || 0;
  const commentsGiven = progress.qualifyingComments || 0;

  const votesPercent = votesReq > 0 ? Math.min((votesGiven / votesReq) * 100, 100) : 100;
  const commentsPercent = commentsReq > 0 ? Math.min((commentsGiven / commentsReq) * 100, 100) : 100;

  let percentage = 0;
  if (votesReq > 0 && commentsReq > 0) {
    percentage = Math.round((votesPercent + commentsPercent) / 2);
  } else if (votesReq > 0) {
    percentage = Math.round(votesPercent);
  } else if (commentsReq > 0) {
    percentage = Math.round(commentsPercent);
  } else {
    percentage = 100;
  }

  const votesLeft = Math.max(0, votesReq - votesGiven);
  const commentsLeft = Math.max(0, commentsReq - commentsGiven);

  return (
    <Card className="mb-4 border-primary/20 bg-primary/5 shadow-none">
      <CardContent className="px-4">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-lg leading-none shrink-0">{t("title")}</CardTitle>
          <p className="text-sm text-muted-foreground text-right">
            {progress.canPost ? t("unlocked") : t("locked", { votes: votesLeft, comments: commentsLeft })}
          </p>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <Progress value={percentage} className="h-2 flex-1" />
          <span className="text-sm font-medium text-muted-foreground shrink-0">{percentage}%</span>
        </div>
      </CardContent>
    </Card>
  );
}
