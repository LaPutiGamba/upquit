"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { commentService, default as CommentResponse } from "../services/commentService";
import { CommentForm } from "./CommentForm";
import { MessageCircleMore } from "lucide-react";
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
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const syncChannelName = `comments:${requestId}`;
  const commentCount = comments.length;

  const sortedRootComments = [...comments]
    .filter((comment) => !comment.parentId)
    .sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });

  const getReplies = (parentId: string) => {
    return [...comments]
      .filter((comment) => comment.parentId === parentId)
      .sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeA - timeB;
      });
  };

  const getDisplayName = (comment: CommentResponse) => {
    if (comment.authorDisplayName && comment.authorDisplayName.trim().length > 0) {
      return comment.authorDisplayName;
    }
    if (comment.isAdminReply) return "Admin";
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
    if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return;

    const channel = new BroadcastChannel(syncChannelName);
    const handleSyncMessage = (event: MessageEvent) => {
      if (event.data?.type === "COMMENT_SYNC") fetchComments();
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

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className={cn("shrink-0 border-b border-border/60 pb-5", isDialog ? "" : "bg-background/95")}>
        <div className="mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-semibold tracking-tight">Comments</h3>
              <span className="inline-flex h-6 items-center gap-1.5 rounded-full border border-border/70 bg-muted/35 px-2.5 text-xs font-semibold text-muted-foreground">
                <MessageCircleMore aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
                <span className="tabular-nums leading-none">{commentCount}</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Join the conversation and share your thoughts.</p>
          </div>
        </div>

        <CommentForm requestId={requestId} boardId={boardId} onCommentAdded={fetchComments} isDialog={isDialog} />
      </div>

      <div className={cn("min-h-0 flex-1 overflow-y-auto px-2 pt-6", isDialog ? "pb-4" : "pb-6")}>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <p className="text-sm text-muted-foreground">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="flex justify-center py-12">
            <p className="text-sm text-muted-foreground">No comments yet. Be the first to start the thread!</p>
          </div>
        ) : (
          <ul className="space-y-6">
            {sortedRootComments.map((rootComment) => {
              const replies = getReplies(rootComment.id);
              const hasReplies = replies.length > 0;
              const isReplying = replyingTo === rootComment.id;
              const showConnectionLine = hasReplies || isReplying;

              return (
                <li key={rootComment.id} className="relative">
                  {/* Connection Line */}
                  {showConnectionLine && (
                    <div className="absolute left-7.25 top-10 bottom-2 w-px bg-border/80 z-0" aria-hidden="true" />
                  )}

                  {/* Root Comment Box */}
                  <div className="relative z-10 flex gap-3 group transition-colors rounded-md px-3 py-2 hover:bg-muted/30">
                    <Avatar className="size-9 shrink-0">
                      {rootComment.authorAvatarUrl && (
                        <AvatarImage src={rootComment.authorAvatarUrl} alt={getDisplayName(rootComment)} />
                      )}
                      <AvatarFallback className="text-xs font-semibold">
                        {getDisplayName(rootComment).substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1 space-y-1.5 pb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{getDisplayName(rootComment)}</span>
                        {rootComment.isAdminReply && (
                          <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-800 dark:bg-green-900 dark:text-green-100">
                            Admin
                          </span>
                        )}
                        {rootComment.createdAt && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(rootComment.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        )}
                      </div>
                      <p className="whitespace-pre-wrap wrap-anywhere text-sm leading-relaxed text-foreground/90">
                        {rootComment.content}
                      </p>

                      <div className="pt-0.5">
                        <button
                          onClick={() => setReplyingTo(replyingTo === rootComment.id ? null : rootComment.id)}
                          className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Replies Container */}
                  {showConnectionLine && (
                    <div className="relative z-10 ml-7.5 pl-5 flex flex-col gap-4 mt-3 pb-1">
                      {/* Render Replies */}
                      {replies.map((reply) => (
                        <div
                          key={reply.id}
                          className="flex gap-3 group transition-colors rounded-md px-3 py-2 hover:bg-muted/30"
                        >
                          <Avatar className="size-7 shrink-0 mt-0.5">
                            {reply.authorAvatarUrl && (
                              <AvatarImage src={reply.authorAvatarUrl} alt={getDisplayName(reply)} />
                            )}
                            <AvatarFallback className="text-[10px] font-semibold">
                              {getDisplayName(reply).substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-foreground">{getDisplayName(reply)}</span>
                              {reply.isAdminReply && (
                                <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-800 dark:bg-green-900 dark:text-green-100">
                                  Admin
                                </span>
                              )}
                              {reply.createdAt && (
                                <span className="text-xs text-muted-foreground">
                                  {new Date(reply.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}
                                </span>
                              )}
                            </div>
                            <p className="whitespace-pre-wrap wrap-anywhere text-sm leading-relaxed text-foreground/90">
                              {reply.content}
                            </p>
                          </div>
                        </div>
                      ))}

                      {/* Reply Form */}
                      {isReplying && (
                        <div className="pr-2 pt-1 animate-in fade-in slide-in-from-top-2 duration-200">
                          <CommentForm
                            requestId={requestId}
                            boardId={boardId}
                            parentId={rootComment.id}
                            isDialog={isDialog}
                            onCommentAdded={() => {
                              fetchComments();
                              setReplyingTo(null);
                            }}
                            onCancel={() => setReplyingTo(null)}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
