"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { commentService, default as CommentResponse } from "../services/commentService";
import { CommentForm } from "./CommentForm";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";

interface CommentSectionProps {
  requestId: string;
  boardId: string;
}

export function CommentSection({ requestId, boardId }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleCommentAdded = () => {
    fetchComments();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Comments</h3>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <p className="text-muted-foreground">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="flex justify-center py-8">
            <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <ul className="space-y-3 border-l-2 border-border pl-4">
            {comments.map((comment) => (
              <li key={comment.id} className="rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
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

      <div className="rounded-lg border border-border bg-card p-4">
        <CommentForm requestId={requestId} boardId={boardId} onCommentAdded={handleCommentAdded} />
      </div>
    </div>
  );
}
