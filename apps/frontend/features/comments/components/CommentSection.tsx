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

  const composerStyle = isDialog
    ? {
        background:
          "linear-gradient(to top, hsl(var(--background)) 62%, hsl(var(--background) / 0.82) 84%, hsl(var(--background) / 0) 100%)",
        boxShadow: "0 -18px 34px -22px hsl(var(--foreground) / 0.6), 0 -4px 10px -10px hsl(var(--foreground) / 0.55)"
      }
    : {
        background:
          "linear-gradient(to top, hsl(var(--background)) 65%, hsl(var(--background) / 0.78) 86%, hsl(var(--background) / 0) 100%)",
        boxShadow: "0 -14px 28px -22px hsl(var(--foreground) / 0.5)"
      };

  return (
    <div className={cn("flex h-full min-h-0 flex-col gap-0")}>
      {/* Comments Header */}
      <div className="pb-4">
        <h3 className="text-lg font-semibold">Comments</h3>
      </div>

      {/* Comments List Container */}
      <div className={cn("min-h-0 flex-1 overflow-y-auto space-y-3 pr-2", isDialog ? "pb-20" : "pb-24")}>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <p className="text-muted-foreground">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="flex justify-center py-8">
            <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <ul className={cn("space-y-3")}>
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

                    <p className="text-sm text-foreground">{comment.content}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Comment Form - Sticky Footer */}
      <div
        className={cn("sticky bottom-0 z-10 shrink-0", isDialog ? "-mx-6 -mb-6 p-6" : "-mx-2 px-2 pb-2 pt-3")}
        style={composerStyle}
      >
        <CommentForm requestId={requestId} boardId={boardId} onCommentAdded={handleCommentAdded} isDialog={isDialog} />
      </div>
    </div>
  );
}
