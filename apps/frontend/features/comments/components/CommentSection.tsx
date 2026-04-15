"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { commentService, default as CommentResponse } from "../services/commentService";
import { CommentForm } from "./CommentForm";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { cn } from "@/shared/lib/utils";
import { useChannel } from "@/shared/hooks/useChannel";

interface CommentSectionProps {
  requestId: string;
  boardId: string;
  isDialog?: boolean;
}

export function CommentSection({ requestId, boardId, isDialog = false }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const syncChannelName = `comments:${requestId}`;
  const commentCountLabel = comments.length === 1 ? "1 comment" : `${comments.length} comments`;

  const getDisplayName = (comment: CommentResponse) => {
    if (comment.authorDisplayName && comment.authorDisplayName.trim().length > 0) {
      return comment.authorDisplayName;
    }

    if (comment.isAdminReply) {
      return "Admin";
    }

    return "Unknown user";
  };

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
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
      return;
    }

    const channel = new BroadcastChannel(syncChannelName);

    const handleSyncMessage = (event: MessageEvent) => {
      if (event.data?.type === "COMMENT_SYNC") {
        fetchComments();
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
      fetchComments();
    }
  });

  const handleCommentAdded = () => {
    fetchComments();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className={cn("shrink-0 border-b border-border/60 pb-4", isDialog ? "" : "bg-background/95")}>
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">Comments</h3>
            <p className="text-sm text-muted-foreground">Add a reply and keep the thread moving.</p>
          </div>

          <span className="rounded-full border border-border/70 bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {commentCountLabel}
          </span>
        </div>

        <CommentForm requestId={requestId} boardId={boardId} onCommentAdded={handleCommentAdded} isDialog={isDialog} />
      </div>

      <div className={cn("min-h-0 flex-1 overflow-y-auto pr-2 pt-4", isDialog ? "pb-4" : "pb-4")}>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <p className="text-muted-foreground">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="flex justify-center py-8">
            <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {comments.map((comment) => (
              <li
                key={comment.id}
                className={cn(
                  "rounded-lg p-3 transition-colors",
                  isDialog ? "bg-muted/40 hover:bg-muted/60" : "bg-muted/50 hover:bg-muted"
                )}
                style={{
                  boxShadow: "0 1px 0 0 var(--border) inset"
                }}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="size-9">
                    {comment.authorAvatarUrl ? (
                      <AvatarImage src={comment.authorAvatarUrl} alt={getDisplayName(comment)} />
                    ) : null}
                    <AvatarFallback className="text-xs font-semibold">
                      {getDisplayName(comment)
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-sm font-medium text-foreground">{getDisplayName(comment)}</span>
                      {comment.createdAt && (
                        <time className="text-xs text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </time>
                      )}
                    </div>

                    {comment.isAdminReply && (
                      <span className="inline-block rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800 dark:bg-green-900 dark:text-green-100">
                        Admin
                      </span>
                    )}

                    <p className="whitespace-pre-wrap wrap-anywhere text-sm text-foreground">{comment.content}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
