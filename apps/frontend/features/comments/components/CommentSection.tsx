"use client";

import { useMemo, useState } from "react";
import { ArrowDownAZ, ListOrdered, Shield } from "lucide-react";
import { CommentForm } from "./CommentForm";
import { cn } from "@/shared/lib/utils";
import { useComments } from "../hooks/useComments";
import { CommentThread } from "./CommentThread";
import type { CommentFilters } from "../services/commentService";
import type CommentResponse from "../services/commentService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Toggle } from "@/shared/components/ui/toggle";
import { Separator } from "@/shared/components/ui/separator";

interface CommentSectionProps {
  requestId: string;
  boardId: string;
  isBoardAdmin?: boolean;
  isDialog?: boolean;
}

export function CommentSection({ requestId, boardId, isBoardAdmin = false, isDialog = false }: CommentSectionProps) {
  const [filters, setFilters] = useState<CommentFilters>({ sortBy: "newest_first" });
  const { comments, isLoading, addComment } = useComments(requestId, boardId, { sortBy: filters.sortBy });
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const { rootComments, repliesByParentId } = useMemo(() => {
    const roots: CommentResponse[] = [];
    const repliesByParentId = new Map<string, CommentResponse[]>();

    const compareComments = (a: CommentResponse, b: CommentResponse) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

      return filters.sortBy === "oldest_first" ? timeA - timeB : timeB - timeA;
    };

    for (const comment of comments) {
      if (!comment.parentId) {
        roots.push(comment);
        continue;
      }

      const replies = repliesByParentId.get(comment.parentId) ?? [];
      replies.push(comment);
      repliesByParentId.set(comment.parentId, replies);
    }

    roots.sort(compareComments);

    for (const replies of repliesByParentId.values()) {
      replies.sort(compareComments);
    }

    if (!filters.adminOnly) {
      return { rootComments: roots, repliesByParentId };
    }

    const visibleRoots = roots.filter((rootComment) => {
      if (rootComment.isAdminReply) {
        return true;
      }

      const directReplies = repliesByParentId.get(rootComment.id) ?? [];
      return directReplies.some((reply) => reply.isAdminReply);
    });

    const visibleRepliesByParentId = new Map<string, CommentResponse[]>();
    for (const rootComment of visibleRoots) {
      const directReplies = repliesByParentId.get(rootComment.id) ?? [];
      visibleRepliesByParentId.set(
        rootComment.id,
        directReplies.filter((reply) => reply.isAdminReply)
      );
    }

    return { rootComments: visibleRoots, repliesByParentId: visibleRepliesByParentId };
  }, [comments, filters.adminOnly, filters.sortBy]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className={cn("shrink-0 border-b border-border/60 pb-4", isDialog ? "" : "bg-background/95")}>
        <CommentForm
          requestId={requestId}
          boardId={boardId}
          isBoardAdmin={isBoardAdmin}
          onCommentAdded={addComment}
          isDialog={isDialog}
        />

        <div className="mt-3 flex items-center gap-2">
          <Select
            value={filters.sortBy ?? "newest_first"}
            onValueChange={(v) =>
              setFilters((f) => ({
                ...f,
                sortBy: v as "newest_first" | "oldest_first"
              }))
            }
          >
            <SelectTrigger className="h-8 w-fit text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest_first">
                <div className="flex items-center gap-2">
                  <ArrowDownAZ className="size-3.5" />
                  Newest first
                </div>
              </SelectItem>
              <SelectItem value="oldest_first">
                <div className="flex items-center gap-2">
                  <ListOrdered className="size-3.5" />
                  Oldest first
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <Separator orientation="vertical" className="h-6" />

          <Toggle
            size="sm"
            pressed={filters.adminOnly ?? false}
            onPressedChange={(pressed) => setFilters((f) => ({ ...f, adminOnly: pressed }))}
            className="h-8 gap-1.5 text-xs"
            aria-label="Show only admin replies"
          >
            <Shield className="size-3.5" />
            Admin only
          </Toggle>
        </div>
      </div>

      <div className={cn("min-h-0 flex-1 overflow-y-auto px-2 pt-4", isDialog ? "pb-4" : "pb-6")}>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <p className="text-sm text-muted-foreground">Loading comments…</p>
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
                isBoardAdmin={isBoardAdmin}
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
