"use client";

import { useEffect, useState } from "react";
import { CalendarClock, Filter, MessageSquare, Search, X } from "lucide-react";

import { CommentSection } from "@/features/comments/components/CommentSection";
import { boardService } from "@/features/boards/services/boardService";
import { requestService, type RequestChangelogResponse } from "@/features/requests/services/requestService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { RequestHistoryPanel } from "@/features/requests/components/RequestHistoryPanel";
import { cn } from "@/shared/lib/utils";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/shared/components/ui/dropdown-menu";

const CHANGELOG_FIELDS = [
  { value: "title", label: "Title" },
  { value: "description", label: "Description" },
  { value: "status", label: "Status" },
  { value: "categoryIds", label: "Categories" },
  { value: "isPinned", label: "Pinned" },
  { value: "isHidden", label: "Hidden" },
  { value: "adminNote", label: "Admin note" }
];

interface RequestActivityTabsProps {
  requestId: string;
  boardId: string;
  isBoardAdmin?: boolean;
  refreshToken?: number;
  isDialog?: boolean;
  className?: string;
}

export function RequestActivityTabs({
  requestId,
  boardId,
  isBoardAdmin = false,
  refreshToken = 0,
  isDialog = false,
  className
}: RequestActivityTabsProps) {
  const [changelogEntries, setChangelogEntries] = useState<RequestChangelogResponse[]>([]);
  const [changelogLoading, setChangelogLoading] = useState(false);
  const [changelogError, setChangelogError] = useState<string | null>(null);
  const [categoryNamesById, setCategoryNamesById] = useState<Record<string, string>>({});
  const [changelogFilters, setChangelogFilters] = useState<{
    field?: string[];
    userId?: string;
    search?: string;
  }>({});

  const selectedFields = changelogFilters.field ?? [];

  useEffect(() => {
    let cancelled = false;

    const loadChangelog = async () => {
      setChangelogLoading(true);
      setChangelogError(null);

      try {
        const [history, categories] = await Promise.all([
          requestService.getRequestChangelogByRequestId(requestId, boardId, changelogFilters),
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
  }, [boardId, requestId, refreshToken, changelogFilters]);

  const activeFilterCount = [
    selectedFields.length > 0 ? "field" : undefined,
    changelogFilters.userId,
    changelogFilters.search
  ].filter(Boolean).length;

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
        <CommentSection requestId={requestId} boardId={boardId} isBoardAdmin={isBoardAdmin} isDialog={isDialog} />
      </TabsContent>

      <TabsContent
        value="history"
        forceMount
        className={cn("min-h-0 flex-1 outline-none", isDialog ? "mt-3 flex flex-col" : "mt-4 flex flex-col")}
      >
        <div className="flex flex-col gap-2 px-1 py-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={changelogFilters.search ?? ""}
                onChange={(e) => setChangelogFilters((f) => ({ ...f, search: e.target.value || undefined }))}
                className="pl-9"
                placeholder="Search changes..."
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <Filter className="size-4" />
                  {activeFilterCount > 0 && (
                    <Badge
                      variant="default"
                      className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full p-0 text-[10px]"
                    >
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Field</DropdownMenuLabel>
                {CHANGELOG_FIELDS.map((field) => (
                  <DropdownMenuCheckboxItem
                    key={field.value}
                    checked={selectedFields.includes(field.value)}
                    onSelect={(event) => event.preventDefault()}
                    onCheckedChange={(checked) => {
                      setChangelogFilters((f) => ({
                        ...f,
                        field: checked
                          ? [...new Set([...(f.field ?? []), field.value])]
                          : (f.field ?? []).filter((selectedField) => selectedField !== field.value)
                      }));
                    }}
                  >
                    {field.label}
                  </DropdownMenuCheckboxItem>
                ))}

                {selectedFields.length > 0 ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={(event) => {
                        event.preventDefault();
                        setChangelogFilters((f) => ({ ...f, field: undefined }));
                      }}
                    >
                      <X className="size-4" />
                      Clear fields
                    </DropdownMenuItem>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

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
