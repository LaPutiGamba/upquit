"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Search, Filter, X } from "lucide-react";

import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/shared/components/ui/dropdown-menu";
import type { RequestResponse } from "@/features/requests/services/requestService";
import type { BoardResponse } from "@/features/boards/services/boardService";

export interface RequestFilters {
  status?: string[];
  categoryId?: string;
  search?: string;
  sortBy?: "newest" | "oldest" | "recently_updated";
  authorId?: string;
  excludePinned?: boolean;
}

interface RequestFilterBarProps {
  board: BoardResponse;
  categories: { id: string; name: string; hexColor: string }[];
  authors: { id: string; displayName: string }[];
  requests: RequestResponse[];
  onFilterChange: (filters: RequestFilters) => void;
}

const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "planned", label: "Planned" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "rejected", label: "Rejected" }
];

export function RequestFilterBar(props: RequestFilterBarProps) {
  const t = useTranslations("RequestFilters");
  const { categories, onFilterChange } = props;

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState<string[]>([]);
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "recently_updated">("newest");
  const [excludePinned, setExcludePinned] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchTerm(searchInput.trim());
    }, 250);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    onFilterChange({
      search: searchTerm || undefined,
      status: status.length > 0 ? status : undefined,
      categoryId,
      sortBy,
      excludePinned: excludePinned || undefined
    });
  }, [searchTerm, status, categoryId, sortBy, excludePinned, onFilterChange]);

  const toggleStatus = useCallback((value: string) => {
    setStatus((prev) => (prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]));
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchInput("");
    setSearchTerm("");
    setStatus([]);
    setCategoryId(undefined);
    setSortBy("newest");
    setExcludePinned(false);
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (status.length > 0) count++;
    if (categoryId) count++;
    if (excludePinned) count++;
    return count;
  }, [searchTerm, status, categoryId, excludePinned]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
            placeholder={t("searchPlaceholder")}
          />
        </div>

        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder={t("sortLabel")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{t("sortNewest")}</SelectItem>
            <SelectItem value="oldest">{t("sortOldest")}</SelectItem>
            <SelectItem value="recently_updated">{t("sortRecentlyUpdated")}</SelectItem>
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative shrink-0" aria-label={t("filters")}>
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
            <DropdownMenuLabel>{t("statusLabel")}</DropdownMenuLabel>
            {STATUS_OPTIONS.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={status.includes(option.value)}
                onSelect={(event) => event.preventDefault()}
                onCheckedChange={() => toggleStatus(option.value)}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}

            {categories.length > 0 ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>{t("categoryLabel")}</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={!categoryId}
                  onSelect={(event) => event.preventDefault()}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setCategoryId(undefined);
                    }
                  }}
                >
                  {t("allCategories")}
                </DropdownMenuCheckboxItem>
                {categories.map((cat) => (
                  <DropdownMenuCheckboxItem
                    key={cat.id}
                    checked={categoryId === cat.id}
                    onSelect={(event) => event.preventDefault()}
                    onCheckedChange={(checked) => {
                      setCategoryId(checked ? cat.id : undefined);
                    }}
                  >
                    {cat.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </>
            ) : null}

            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={excludePinned}
              onSelect={(event) => event.preventDefault()}
              onCheckedChange={(checked) => setExcludePinned(!!checked)}
            >
              {t("hidePinned")}
            </DropdownMenuCheckboxItem>

            {activeFilterCount > 0 ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();
                    clearAllFilters();
                  }}
                >
                  <X className="size-4" />
                  {t("clearAll")}
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
