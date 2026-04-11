"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { giveToGetService } from "@/features/give-to-get/services/giveToGetService";
import { requestService } from "../services/requestService";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/shared/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { toast } from "@/shared/components/ui/sonner";

const createRequestSchema = z.object({
  title: z.string().trim().min(1, "Please enter a title"),
  description: z.string().trim().optional()
});

type CreateRequestFormValues = z.infer<typeof createRequestSchema>;

interface CreateRequestFormProps {
  boardId: string;
  giveToGetEnabled?: boolean | null;
  onRequestCreated?: () => void | Promise<void>;
}

export function CreateRequestForm({ boardId, giveToGetEnabled, onRequestCreated }: CreateRequestFormProps) {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [canPost, setCanPost] = useState(false);
  const [isProgressLoading, setIsProgressLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateRequestFormValues>({
    // @ts-expect-error - zodResolver type mismatch
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      title: "",
      description: ""
    }
  });

  useEffect(() => {
    setIsHydrated(true);

    if (!giveToGetEnabled) {
      setCanPost(true);
      setIsProgressLoading(false);
      return;
    }

    const fetchProgress = async () => {
      try {
        setIsProgressLoading(true);
        const token = localStorage.getItem("accessToken");

        if (!token) {
          setCanPost(false);
          return;
        }

        const progress = await giveToGetService.getProgress(boardId, token);
        setCanPost(Boolean(progress.canPost));
      } catch (error) {
        const message = error instanceof Error ? error.message.toLowerCase() : "";

        if (!message.includes("progress not found")) {
          console.error("Error fetching Give-to-Get progress:", error);
        }

        setCanPost(false);
      } finally {
        setIsProgressLoading(false);
      }
    };

    fetchProgress();
  }, [boardId, giveToGetEnabled]);

  const onSubmit = async (data: CreateRequestFormValues) => {
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        toast.error("You must be logged in to create a request");
        return;
      }

      await requestService.createRequest(
        boardId,
        data.title,
        data.description?.trim() ? data.description : null,
        token
      );

      form.reset({ title: "", description: "" });
      setIsDialogOpen(false);
      toast.success("Request created successfully");

      if (onRequestCreated) {
        await onRequestCreated();
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error("Error creating request:", error);
      toast.error("Failed to create request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestForm = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Request Title</FormLabel>
              <FormControl>
                <Input placeholder="What feature would you like to request?" disabled={isSubmitting} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide more details about your request..."
                  className="min-h-28"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Request"}
        </Button>
      </form>
    </Form>
  );

  if (giveToGetEnabled && (!isHydrated || isProgressLoading || !canPost)) {
    return (
      <div className="flex items-center gap-3">
        <Button aria-disabled="true" tabIndex={-1} className="pointer-events-none opacity-50">
          Contribute to unlock posting
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>New Request</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new request</DialogTitle>
          <DialogDescription>Share your idea with details so others can vote and discuss it.</DialogDescription>
        </DialogHeader>

        {requestForm}
      </DialogContent>
    </Dialog>
  );
}
