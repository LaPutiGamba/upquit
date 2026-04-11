"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { commentService } from "../services/commentService";

interface CommentFormProps {
  requestId: string;
  boardId: string;
  onCommentAdded: () => void;
}

export function CommentForm({ requestId, boardId, onCommentAdded }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("You must be logged in to comment");
        return;
      }

      await commentService.createComment(requestId, boardId, content.trim(), token);

      setContent("");
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        placeholder="Add a comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isLoading}
        className="min-h-24"
      />
      <Button type="submit" disabled={isLoading || !content.trim()}>
        {isLoading ? "Posting..." : "Post Comment"}
      </Button>
    </form>
  );
}
