"use client";

import { useEffect, useState } from "react";
import { giveToGetService, GiveToGetProgressResponse } from "../services/giveToGetService";
import { BoardResponse } from "@/features/boards/services/boardService";
import { Progress } from "@/shared/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { useChannel } from "@/shared/hooks/useChannel";

interface GiveToGetTrackerProps {
  board: BoardResponse;
}

export function GiveToGetTracker({ board }: GiveToGetTrackerProps) {
  const [progress, setProgress] = useState<GiveToGetProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserId(payload.userId || payload.sub);
      } catch (e) {
        console.error("Failed to parse token", e);
      }
    }
  }, []);

  useEffect(() => {
    if (!board.giveToGetEnabled || !userId) {
      if (!board.giveToGetEnabled) setLoading(false);
      return;
    }

    const fetchProgress = async () => {
      try {
        const token = localStorage.getItem("accessToken")!;
        const data = await giveToGetService.getProgress(userId, board.id, token);
        setProgress(data);
      } catch (error) {
        const isNotFoundError = error instanceof Error && error.message.toLowerCase().includes("not found");

        if (isNotFoundError) {
          try {
            const token = localStorage.getItem("accessToken")!;
            const newData = await giveToGetService.createProgress(userId, board.id, token);
            setProgress(newData);
          } catch (createError) {
            console.error("Failed to auto-create give-to-get progress", createError);
          }
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

  if (loading) return <div className="h-24 animate-pulse bg-muted rounded-lg w-full mb-8"></div>;
  if (!progress) return null;

  const votesReq = board.giveToGetVotesReq || 0;
  const commentsReq = board.giveToGetCommentsReq || 0;
  const votesGiven = progress.votesGiven || 0;
  const commentsGiven = progress.qualifyingComments || 0;

  const totalRequired = votesReq + commentsReq;
  const totalGiven = votesGiven + commentsGiven;

  const percentage = totalRequired === 0 ? 100 : Math.min(100, Math.round((totalGiven / totalRequired) * 100));

  const votesLeft = Math.max(0, votesReq - votesGiven);
  const commentsLeft = Math.max(0, commentsReq - commentsGiven);

  return (
    <Card className="mb-8 border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Your Contribution Progress</CardTitle>
          <span className="text-sm font-medium text-muted-foreground">{percentage}%</span>
        </div>
      </CardHeader>
      <CardContent>
        <Progress value={percentage} className="h-2 mb-3" />
        <p className="text-sm text-muted-foreground">
          {progress.canPost
            ? "🎉 You have unlocked the ability to post new feature requests!"
            : `Give to Get: You need ${votesLeft} more votes and ${commentsLeft} more comments to publish a request.`}
        </p>
      </CardContent>
    </Card>
  );
}
