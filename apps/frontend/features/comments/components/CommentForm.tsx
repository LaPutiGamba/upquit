"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { Kbd, KbdGroup } from "@/shared/components/ui/kbd";
import { Send } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { commentService, type default as CommentResponse } from "../services/commentService";

interface CommentFormProps {
  requestId: string;
  boardId: string;
  onCommentAdded: (comment: CommentResponse) => void;
  isDialog?: boolean;
  parentId?: string;
  onCancel?: () => void;
}

export function CommentForm({
  requestId,
  boardId,
  onCommentAdded,
  isDialog = false,
  parentId,
  onCancel
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const syncChannelName = `comments:${requestId}`;

  const notifyOtherTabs = (comment: CommentResponse) => {
    if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
      return;
    }

    const channel = new BroadcastChannel(syncChannelName);
    channel.postMessage({ type: "CommentSync", action: "added", requestId, comment });
    channel.close();
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${Math.min(scrollHeight + 2, 384)}px`;
      textarea.style.overflowY = scrollHeight > 376 ? "auto" : "hidden";
    }
  }, [content]);

  useEffect(() => {
    if (parentId && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [parentId]);

  const submitComment = async () => {
    if (!content.trim() || isPending) {
      toast.error("Please enter a comment");
      return;
    }

    startTransition(async () => {
      try {
        const createdComment = await commentService.createComment(requestId, boardId, content.trim(), parentId);

        setContent("");
        notifyOtherTabs(createdComment);
        toast.success(parentId ? "Reply posted successfully" : "Comment posted successfully");
        onCommentAdded(createdComment);

        if (onCancel) {
          onCancel();
        }
      } catch (error) {
        console.error("Error posting comment:", error);
        toast.error("Failed to post comment");
      }
    });
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    await submitComment();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      void submitComment();
    }

    if (e.key === "Escape" && onCancel) {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="relative w-full px-2 py-1">
        <Textarea
          ref={textareaRef}
          placeholder={parentId ? "Write a reply..." : "Add a comment..."}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isPending}
          className={cn(
            "resize-none overscroll-none transition-colors w-full",
            "bg-background/70 focus:bg-background",
            "min-h-11 max-h-96 py-3 pl-3 pr-12",
            isDialog && "bg-muted/30 focus:bg-muted/50"
          )}
          rows={1}
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="submit"
              disabled={isPending || !content.trim()}
              size="icon-sm"
              className={cn(
                "absolute right-4 top-1/2 -translate-y-1/2 transition-all shadow-none",
                !content.trim() && "opacity-50"
              )}
            >
              <Send className="size-4" />
              <span className="sr-only">{parentId ? "Send reply" : "Send comment"}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{parentId ? "Send reply" : "Send comment"}</TooltipContent>
        </Tooltip>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span>Press</span>
          <KbdGroup>
            <Kbd>Ctrl</Kbd>
            <span>/</span>
            <Kbd>Cmd</Kbd>
            <span>+</span>
            <Kbd>Enter</Kbd>
          </KbdGroup>
          <span>to send</span>
        </span>
        {onCancel ? (
          <span className="flex items-center gap-1.5">
            <span>| Press</span>
            <Kbd>Esc</Kbd>
            <span>to cancel</span>
          </span>
        ) : null}
      </div>

      {onCancel && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isPending}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>
        </div>
      )}
    </form>
  );
}
