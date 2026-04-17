"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { useChannel } from "@/shared/hooks/useChannel";
import { commentService, type default as CommentResponse } from "../services/commentService";

type UseCommentsResult = {
  comments: CommentResponse[];
  isLoading: boolean;
  refetch: () => Promise<void>;
};

export function useComments(requestId: string, boardId: string): UseCommentsResult {
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const syncChannelName = `comments:${requestId}`;

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
      if (event.data?.type === "COMMENT_SYNC") {
        void fetchComments();
      }
    };

    channel.addEventListener("message", handleSyncMessage);
    return () => {
      channel.removeEventListener("message", handleSyncMessage);
      channel.close();
    };
  }, [fetchComments, syncChannelName]);

  useChannel(requestId, (message) => {
    if (message.event === "COMMENT_ADDED" || message.event === "COMMENT_DELETED") {
      void fetchComments();
    }
  });

  return {
    comments,
    isLoading,
    refetch: fetchComments
  };
}
