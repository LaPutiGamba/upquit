"use client";

import { useEffect, useState } from "react";
import { CalendarClock, MessageSquare } from "lucide-react";

import { CommentSection } from "@/features/comments/components/CommentSection";
import { boardService } from "@/features/boards/services/boardService";
import { requestService, type RequestChangelogResponse } from "@/features/requests/services/requestService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { RequestHistoryPanel } from "@/features/requests/components/RequestHistoryPanel";
import { cn } from "@/shared/lib/utils";

interface RequestActivityTabsProps {
  requestId: string;
  boardId: string;
  refreshToken?: number;
  isDialog?: boolean;
  className?: string;
}

export function RequestActivityTabs({
  requestId,
  boardId,
  refreshToken = 0,
  isDialog = false,
  className
}: RequestActivityTabsProps) {
  const [changelogEntries, setChangelogEntries] = useState<RequestChangelogResponse[]>([]);
  const [changelogLoading, setChangelogLoading] = useState(false);
  const [changelogError, setChangelogError] = useState<string | null>(null);
  const [categoryNamesById, setCategoryNamesById] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;

    const loadChangelog = async () => {
      setChangelogLoading(true);
      setChangelogError(null);

      try {
        const [history, categories] = await Promise.all([
          requestService.getRequestChangelogByRequestId(requestId, boardId),
          boardService.getBoardCategories(boardId)
        ]);

        if (!cancelled) {
          setChangelogEntries(history);
          setCategoryNamesById(
            categories.reduce<Record<string, string>>((accumulator, category) => {
              accumulator[category.id] = category.name;
              return accumulator;
            }, {})
          );
        }
      } catch {
        if (!cancelled) {
          setChangelogError("Could not load history");
          setChangelogEntries([]);
          setCategoryNamesById({});
        }
      } finally {
        if (!cancelled) {
          setChangelogLoading(false);
        }
      }
    };

    void loadChangelog();

    return () => {
      cancelled = true;
    };
  }, [boardId, requestId, refreshToken]);

  return (
    <Tabs defaultValue="comments" className={className}>
      <TabsList variant={isDialog ? "line" : "default"} className={cn("w-fit", isDialog && "px-0")}>
        <TabsTrigger value="comments" className="gap-2">
          <MessageSquare className="size-4" />
          Comments
        </TabsTrigger>
        <TabsTrigger value="history" className="gap-2">
          <CalendarClock className="size-4" />
          History
        </TabsTrigger>
      </TabsList>

      <TabsContent
        value="comments"
        forceMount
        className={cn("min-h-0 flex-1 outline-none", isDialog ? "mt-3 flex flex-col" : "mt-4 flex flex-col")}
      >
        <CommentSection requestId={requestId} boardId={boardId} isDialog={isDialog} />
      </TabsContent>

      <TabsContent
        value="history"
        forceMount
        className={cn("min-h-0 flex-1 outline-none", isDialog ? "mt-3 flex flex-col" : "mt-4 flex flex-col")}
      >
        <RequestHistoryPanel
          changelogEntries={changelogEntries}
          changelogLoading={changelogLoading}
          changelogError={changelogError}
          categoryNamesById={categoryNamesById}
        />
      </TabsContent>
    </Tabs>
  );
}
