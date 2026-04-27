"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { giveToGetService, GiveToGetProgressResponse } from "@/features/give-to-get/services/giveToGetService";
import { CategorySelectorMultiple } from "@/features/requests/components/CategorySelectorMultiple";
import { requestService, RequestResponse } from "../services/requestService";
import { useChannel } from "@/shared/hooks/useChannel";
import { decodeJwtPayload } from "@/shared/lib/jwt";
import { getAccessToken } from "@/shared/lib/apiClient";
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
import { Plus } from "lucide-react";

const sectionLabelClassName = "text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground";

const createRequestSchema = z.object({
  title: z.string().trim().min(1, "Please enter a title"),
  description: z.string().trim().optional()
});

type CreateRequestFormValues = z.infer<typeof createRequestSchema>;

interface CreateRequestFormProps {
  boardId: string;
  giveToGetEnabled?: boolean | null;
  onRequestCreated?: (request: RequestResponse) => void | Promise<void>;
}

export function CreateRequestForm({ boardId, giveToGetEnabled, onRequestCreated }: CreateRequestFormProps) {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [canPost, setCanPost] = useState(false);
  const [isProgressLoading, setIsProgressLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);

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
        const token = getAccessToken();
        const payload = token ? decodeJwtPayload(token) : null;
        const nextUserId = payload?.userId || payload?.sub;
        setUserId(nextUserId ?? null);

        const progress = await giveToGetService.getProgress(boardId);
        setCanPost(Boolean(progress.canPost));

        if (!nextUserId) {
          const refreshedToken = getAccessToken();
          const refreshedPayload = refreshedToken ? decodeJwtPayload(refreshedToken) : null;
          const refreshedUserId = refreshedPayload?.userId || refreshedPayload?.sub;

          if (refreshedUserId) {
            setUserId(refreshedUserId);
          }
        }
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

  const channelName = giveToGetEnabled && userId ? `progress.${userId}.${boardId}` : null;

  useChannel<GiveToGetProgressResponse>(channelName, (message) => {
    if (message.event === "ProgressUpdated") {
      setCanPost(Boolean(message.payload.canPost));
      setIsProgressLoading(false);
    }
  });

  const onSubmit = async (data: CreateRequestFormValues) => {
    setIsSubmitting(true);

    try {
      const createdRequest = await requestService.createRequest({
        boardId,
        title: data.title,
        description: data.description?.trim() ? data.description : null,
        categoryIds
      });

      form.reset({ title: "", description: "" });
      setCategoryIds([]);
      setIsDialogOpen(false);
      toast.success("Request created successfully");

      if (onRequestCreated) {
        await onRequestCreated(createdRequest);
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

        <div className="mt-2 space-y-3">
          <p className={sectionLabelClassName}>Categories</p>
          <CategorySelectorMultiple boardId={boardId} value={categoryIds} onChange={setCategoryIds} />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Request"}
        </Button>
      </form>
    </Form>
  );

  if (giveToGetEnabled && (!isHydrated || isProgressLoading || !canPost)) {
    return (
      <div className="flex items-center gap-3">
        <Button aria-disabled="true" tabIndex={-1} variant="outline" className="pointer-events-none opacity-60">
          Contribute to unlock posting
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus />
          New Request
        </Button>
      </DialogTrigger>

      <DialogContent className="rounded-xl border">
        <DialogHeader>
          <DialogTitle>Create a new request</DialogTitle>
          <DialogDescription>Share your idea with details so others can vote and discuss it.</DialogDescription>
        </DialogHeader>

        {requestForm}
      </DialogContent>
    </Dialog>
  );
}
