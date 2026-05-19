"use client";

import type React from "react";
import { memo } from "react";
import { useFormatter } from "next-intl";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { CommentForm } from "./CommentForm";
import type CommentResponse from "../services/commentService";
import { formatDateTimeLocaleAwareWithFormatter } from "@/shared/lib/date";
import { Link } from "@/localization/i18n/routing";

type CommentThreadProps = {
  rootComment: CommentResponse;
  replies: CommentResponse[];
  requestId: string;
  boardId: string;
  isDialog: boolean;
  replyingTo: string | null;
  setReplyingTo: React.Dispatch<React.SetStateAction<string | null>>;
  onCommentAdded: (comment: CommentResponse) => void;
};

function getDisplayName(comment: CommentResponse): string {
  if (comment.authorDisplayName && comment.authorDisplayName.trim().length > 0) {
    return comment.authorDisplayName;
  }
  if (comment.isAdminReply) return "Admin";
  return "Unknown user";
}

function getProfileUrl(comment: CommentResponse): string | null {
  if (comment.authorUsername && comment.authorUsername.trim().length > 0) {
    return `/users/${comment.authorUsername}`;
  }
  return null;
}

export const CommentThread = memo(function CommentThread({
  rootComment,
  replies,
  requestId,
  boardId,
  isDialog,
  replyingTo,
  setReplyingTo,
  onCommentAdded
}: CommentThreadProps) {
  const formatter = useFormatter();
  const hasReplies = replies.length > 0;
  const isReplying = replyingTo === rootComment.id;
  const showConnectionLine = hasReplies || isReplying;

  return (
    <li className="relative">
      {showConnectionLine && (
        <div className="absolute left-7.25 top-10 bottom-2 z-0 w-px bg-border/80" aria-hidden="true" />
      )}

      <div className="group relative z-10 flex gap-3 rounded-md px-3 py-2 transition-colors hover:bg-muted/30">
        {getProfileUrl(rootComment) ? (
          <Link href={getProfileUrl(rootComment)!} className="shrink-0">
            <Avatar className="size-9 shrink-0">
              {rootComment.authorAvatarUrl && (
                <AvatarImage src={rootComment.authorAvatarUrl} alt={getDisplayName(rootComment)} />
              )}
              <AvatarFallback className="text-xs font-semibold">
                {getDisplayName(rootComment).substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
        ) : (
          <Avatar className="size-9 shrink-0">
            {rootComment.authorAvatarUrl && (
              <AvatarImage src={rootComment.authorAvatarUrl} alt={getDisplayName(rootComment)} />
            )}
            <AvatarFallback className="text-xs font-semibold">
              {getDisplayName(rootComment).substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}

        <div className="min-w-0 flex-1 space-y-1.5 pb-1">
          <div className="flex items-center gap-2">
            {getProfileUrl(rootComment) ? (
              <Link href={getProfileUrl(rootComment)!} className="text-sm font-semibold text-foreground hover:underline">
                {getDisplayName(rootComment)}
              </Link>
            ) : (
              <span className="text-sm font-semibold text-foreground">{getDisplayName(rootComment)}</span>
            )}
            {rootComment.isAdminReply && (
              <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-800 dark:bg-green-900 dark:text-green-100">
                Admin
              </span>
            )}
            {rootComment.createdAt && (
              <span className="text-xs text-muted-foreground">
                {formatDateTimeLocaleAwareWithFormatter(formatter, rootComment.createdAt, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </span>
            )}
          </div>
          <p className="wrap-anywhere whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
            {rootComment.content}
          </p>

          <div className="pt-0.5">
            <button
              onClick={() => setReplyingTo(replyingTo === rootComment.id ? null : rootComment.id)}
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Reply
            </button>
          </div>
        </div>
      </div>

      {showConnectionLine && (
        <div className="relative z-10 mt-3 ml-7.5 flex flex-col gap-4 pb-1 pl-5">
          {replies.map((reply) => (
            <div key={reply.id} className="group flex gap-3 rounded-md px-3 py-2 transition-colors hover:bg-muted/30">
              {getProfileUrl(reply) ? (
                <Link href={getProfileUrl(reply)!} className="mt-0.5 shrink-0">
                  <Avatar className="size-7 shrink-0">
                    {reply.authorAvatarUrl && <AvatarImage src={reply.authorAvatarUrl} alt={getDisplayName(reply)} />}
                    <AvatarFallback className="text-[10px] font-semibold">
                      {getDisplayName(reply).substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              ) : (
                <Avatar className="mt-0.5 size-7 shrink-0">
                  {reply.authorAvatarUrl && <AvatarImage src={reply.authorAvatarUrl} alt={getDisplayName(reply)} />}
                  <AvatarFallback className="text-[10px] font-semibold">
                    {getDisplayName(reply).substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  {getProfileUrl(reply) ? (
                    <Link href={getProfileUrl(reply)!} className="text-sm font-medium text-foreground hover:underline">
                      {getDisplayName(reply)}
                    </Link>
                  ) : (
                    <span className="text-sm font-medium text-foreground">{getDisplayName(reply)}</span>
                  )}
                  {reply.isAdminReply && (
                    <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-800 dark:bg-green-900 dark:text-green-100">
                      Admin
                    </span>
                  )}
                  {reply.createdAt && (
                    <span className="text-xs text-muted-foreground">
                      {formatDateTimeLocaleAwareWithFormatter(formatter, reply.createdAt, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  )}
                </div>
                <p className="wrap-anywhere whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                  {reply.content}
                </p>
              </div>
            </div>
          ))}

          {isReplying && (
            <div className="animate-in fade-in slide-in-from-top-2 pr-2 pt-1 duration-200">
              <CommentForm
                requestId={requestId}
                boardId={boardId}
                parentId={rootComment.id}
                isDialog={isDialog}
                onCommentAdded={(comment) => {
                  onCommentAdded(comment);
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
});
