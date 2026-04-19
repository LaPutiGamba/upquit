"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { useChannel } from "@/shared/hooks/useChannel";
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

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
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

  useEffect(() => {
    void fetchComments();
  }, [fetchComments]);

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

        void fetchComments();
      }
    };

    channel.addEventListener("message", handleSyncMessage);
    return () => {
      channel.removeEventListener("message", handleSyncMessage);
      channel.close();
    };
  }, [addComment, fetchComments, syncChannelName]);

  useChannel<CommentRealtimePayload>(requestId, (message) => {
    const payload = message.payload;

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
  });

  return {
    comments,
    isLoading,
    refetch: fetchComments,
    addComment
  };
}
