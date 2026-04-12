"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Send } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { commentService } from "../services/commentService";

interface CommentFormProps {
  requestId: string;
  boardId: string;
  onCommentAdded: () => void;
  isDialog?: boolean;
}

export function CommentForm({ requestId, boardId, onCommentAdded, isDialog = false }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const syncChannelName = `comments:${requestId}`;

  const notifyOtherTabs = () => {
    if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
      return;
    }

    const channel = new BroadcastChannel(syncChannelName);
    channel.postMessage({ type: "COMMENT_SYNC", requestId });
    channel.close();
  };

  // Auto-expand textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [content]);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    setIsLoading(true);

    try {
      await commentService.createComment(requestId, boardId, content.trim());

      setContent("");
      notifyOtherTabs();
      toast.success("Comment posted successfully");
      onCommentAdded();
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("Failed to post comment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex gap-3 items-start">
        <Textarea
          ref={textareaRef}
          placeholder="Add a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isLoading}
          className={cn(
            "resize-none overscroll-none transition-colors",
            "bg-background/70 focus:bg-background",
            "min-h-10 max-h-28 py-2.5",
            isDialog && "bg-muted/30 focus:bg-muted/50"
          )}
          rows={1}
        />
        <Button
          type="submit"
          disabled={isLoading || !content.trim()}
          size="icon"
          className={cn(
            "shrink-0 h-10 w-10 rounded-full shadow-sm transition-all mt-0.5",
            !content.trim() && "opacity-50"
          )}
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Send comment</span>
        </Button>
      </div>
    </form>
  );
}
