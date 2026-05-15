"use client";

import { useEffect, useReducer } from "react";
import { giveToGetService, GiveToGetProgressResponse } from "../services/giveToGetService";
import { BoardResponse } from "@/features/boards/services/boardService";
import { Progress } from "@/shared/components/ui/progress";
import { Card, CardContent, CardTitle } from "@/shared/components/ui/card";
import { useChannel } from "@/shared/hooks/useChannel";
import { decodeJwtPayload } from "@/shared/lib/jwt";
import { getAccessToken } from "@/shared/lib/apiClient";
import { unwrapBroadcastPayload } from "@/shared/lib/realtime";
import { useTranslations } from "next-intl";

interface GiveToGetTrackerProps {
  board: BoardResponse;
}

type GiveToGetState = {
  progress: GiveToGetProgressResponse | null;
  loading: boolean;
  userId: string | null;
  isAuthenticated: boolean;
};

type GiveToGetAction =
  | { type: "SET_USER"; payload: { userId: string | null; isAuthenticated: boolean } }
  | { type: "SET_PROGRESS"; payload: GiveToGetProgressResponse | null }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "DONE" };

type GiveToGetBroadcastPayload = GiveToGetProgressResponse | { data: GiveToGetProgressResponse; timestamp: string };

function giveToGetReducer(state: GiveToGetState, action: GiveToGetAction): GiveToGetState {
  switch (action.type) {
    case "SET_USER":
      return { ...state, userId: action.payload.userId, isAuthenticated: action.payload.isAuthenticated };
    case "SET_PROGRESS":
      return { ...state, progress: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "DONE":
      return { ...state, loading: false };
    default:
      return state;
  }
}

export function GiveToGetTracker({ board }: GiveToGetTrackerProps) {
  const t = useTranslations("GiveToGet");

  const [state, dispatch] = useReducer(giveToGetReducer, {
    progress: null,
    loading: true,
    userId: null,
    isAuthenticated: false
  });

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      const payload = decodeJwtPayload(token);
      const nextUserId = payload?.userId || payload?.sub;

      if (nextUserId) {
        dispatch({ type: "SET_USER", payload: { userId: nextUserId, isAuthenticated: true } });
      } else {
        console.error("Failed to parse token");
        dispatch({ type: "DONE" });
      }
    } else {
      dispatch({ type: "DONE" });
    }
  }, []);

  useEffect(() => {
    if (!board.giveToGetEnabled) {
      dispatch({ type: "DONE" });
      return;
    }

    const fetchProgress = async () => {
      try {
        const data = await giveToGetService.getProgress(board.id);
        dispatch({ type: "SET_PROGRESS", payload: data });
        dispatch({ type: "SET_USER", payload: { userId: state.userId, isAuthenticated: true } });

        if (!state.userId) {
          const token = getAccessToken();
          const payload = token ? decodeJwtPayload(token) : null;
          const nextUserId = payload?.userId || payload?.sub;

          if (nextUserId) {
            dispatch({ type: "SET_USER", payload: { userId: nextUserId, isAuthenticated: true } });
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message.toLowerCase() : "";
        const isNotFoundError = message.includes("not found");
        const isUnauthorized = message.includes("unauthorized") || message.includes("not authenticated");

        if (isNotFoundError) {
          try {
            const newData = await giveToGetService.createProgress(board.id);
            dispatch({ type: "SET_PROGRESS", payload: newData });
          } catch (createError) {
            console.error("Failed to auto-create give-to-get progress", createError);
          }
        } else if (isUnauthorized) {
          dispatch({ type: "SET_PROGRESS", payload: null });
        } else {
          console.error("Error fetching give-to-get progress", error);
        }
      } finally {
        dispatch({ type: "DONE" });
      }
    };

    fetchProgress();
  }, [board.id, board.giveToGetEnabled, state.userId]);

  const channelName = state.userId ? `progress.${state.userId}.${board.id}` : null;

  useChannel<GiveToGetBroadcastPayload>(channelName, (message) => {
    if (message.event === "ProgressUpdated") {
      dispatch({ type: "SET_PROGRESS", payload: unwrapBroadcastPayload(message.payload) });
    }
  });

  if (!board.giveToGetEnabled) return null;

  if (state.loading) return <div className="h-16 animate-pulse rounded-md bg-muted/60 w-full mb-4"></div>;

  if (!state.isAuthenticated) {
    return (
      <Card className="mb-4 border-border/60 bg-background shadow-none">
        <CardContent className="px-4 py-3">
          <CardTitle className="text-lg leading-none">{t("title")}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">{t("loginHint")}</p>
        </CardContent>
      </Card>
    );
  }

  if (!state.progress) return null;

  const votesReq = board.giveToGetVotesReq || 0;
  const commentsReq = board.giveToGetCommentsReq || 0;
  const votesGiven = state.progress.votesGiven || 0;
  const commentsGiven = state.progress.qualifyingComments || 0;

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
            {state.progress.canPost ? t("unlocked") : t("locked", { votes: votesLeft, comments: commentsLeft })}
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
