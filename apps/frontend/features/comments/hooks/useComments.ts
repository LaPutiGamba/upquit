"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { useChannel, type IncomingBroadcastMessage } from "@/shared/hooks/useChannel";
import { unwrapBroadcastPayload } from "@/shared/lib/realtime";
import { commentService, type default as CommentResponse } from "../services/commentService";

type UseCommentsResult = {
  comments: CommentResponse[];
  isLoading: boolean;
  refetch: () => Promise<void>;
  addComment: (comment: CommentResponse) => void;
};

type CommentRealtimePayload =
  | {
      requestId: string;
      comment: CommentResponse;
    }
  | {
      requestId: string;
      commentId: string;
    };

export function useComments(requestId: string, boardId: string): UseCommentsResult {
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const syncChannelName = `comments:${requestId}`;

  const addComment = useCallback((comment: CommentResponse) => {
    setComments((prev) => {
      const exists = prev.some((item) => item.id === comment.id);
      if (exists) {
        return prev;
      }

      return [comment, ...prev];
    });
  }, []);

  const loadComments = useCallback(async () => {
    try {
      const fetchedComments = await commentService.getCommentsByRequestId(requestId, boardId);
      setComments(fetchedComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Failed to load comments");
    } finally {
      setIsLoading(false);
    }
  }, [requestId, boardId]);

  const refetchComments = useCallback(async () => {
    setIsLoading(true);
    await loadComments();
  }, [loadComments]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadComments();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadComments]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return;

    const channel = new BroadcastChannel(syncChannelName);
    const handleSyncMessage = (event: MessageEvent) => {
      if (event.data?.type === "CommentSync") {
        const action = event.data?.action;
        if (action === "added" && event.data?.comment) {
          addComment(event.data.comment as CommentResponse);
          return;
        }

        void loadComments();
      }
    };

    channel.addEventListener("message", handleSyncMessage);
    return () => {
      channel.removeEventListener("message", handleSyncMessage);
      channel.close();
    };
  }, [addComment, loadComments, syncChannelName]);

  const handleCommentsChannelMessage = useCallback(
    (message: IncomingBroadcastMessage<CommentRealtimePayload>) => {
      const payload = unwrapBroadcastPayload(message.payload);

      if (message.event === "CommentAdded") {
        if ("comment" in payload) {
          addComment(payload.comment);
        }
        return;
      }

      if (message.event === "CommentDeleted") {
        if ("commentId" in payload) {
          setComments((prev) => prev.filter((item) => item.id !== payload.commentId));
        }
        return;
      }

      if (message.event === "CommentUpdated") {
        if ("comment" in payload) {
          setComments((prev) => prev.map((item) => (item.id === payload.comment.id ? payload.comment : item)));
        }
      }
    },
    [addComment]
  );

  useChannel<CommentRealtimePayload>(requestId, handleCommentsChannelMessage);

  return {
    comments,
    isLoading,
    refetch: refetchComments,
    addComment
  };
}
