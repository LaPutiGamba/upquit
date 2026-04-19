"use client";

import { useMemo, useState } from "react";
import { CommentForm } from "./CommentForm";
import { MessageCircleMore } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useComments } from "../hooks/useComments";
import { CommentThread } from "./CommentThread";
import type CommentResponse from "../services/commentService";

interface CommentSectionProps {
  requestId: string;
  boardId: string;
  isDialog?: boolean;
}

export function CommentSection({ requestId, boardId, isDialog = false }: CommentSectionProps) {
  const { comments, isLoading, addComment } = useComments(requestId, boardId);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const commentCount = comments.length;

  const { rootComments, repliesByParentId } = useMemo(() => {
    const roots: CommentResponse[] = [];
    const repliesByParentId = new Map<string, CommentResponse[]>();

    for (const comment of comments) {
      if (!comment.parentId) {
        roots.push(comment);
        continue;
      }

      const replies = repliesByParentId.get(comment.parentId) ?? [];
      replies.push(comment);
      repliesByParentId.set(comment.parentId, replies);
    }

    roots.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    for (const replies of repliesByParentId.values()) {
      replies.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeA - timeB;
      });
    }

    return { rootComments: roots, repliesByParentId };
  }, [comments]);

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

        <CommentForm requestId={requestId} boardId={boardId} onCommentAdded={addComment} isDialog={isDialog} />
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
            {rootComments.map((rootComment) => (
              <CommentThread
                key={rootComment.id}
                rootComment={rootComment}
                replies={repliesByParentId.get(rootComment.id) ?? []}
                requestId={requestId}
                boardId={boardId}
                isDialog={isDialog}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                onCommentAdded={addComment}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
