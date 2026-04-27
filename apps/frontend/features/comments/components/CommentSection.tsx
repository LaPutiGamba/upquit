"use client";

import { useMemo, useState } from "react";
import { CommentForm } from "./CommentForm";
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
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className={cn("shrink-0 border-b border-border/60 pb-5", isDialog ? "" : "bg-background/95")}>
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
