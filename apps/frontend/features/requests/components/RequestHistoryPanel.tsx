"use client";

import { useMemo, type ReactNode } from "react";
import { MoveRight } from "lucide-react";
import { Spinner } from "@/shared/components/ui/spinner";
import type { RequestChangelogResponse } from "@/features/requests/services/requestService";
import { formatLocalizedDateTimeWithClock } from "@/shared/lib/date";
import {
  formatRequestStatusLabel,
  getRequestStatusColor,
  getRequestStatusIcon
} from "@/features/requests/lib/requestStatusPresentation";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";

interface RequestHistoryPanelProps {
  changelogEntries: RequestChangelogResponse[];
  changelogLoading: boolean;
  changelogError: string | null;
  categoryNamesById: Record<string, string>;
}

export function RequestHistoryPanel({
  changelogEntries,
  changelogLoading,
  changelogError,
  categoryNamesById
}: RequestHistoryPanelProps) {
  const sortedChangelogEntries = useMemo(() => {
    return [...changelogEntries].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

      return dateB - dateA;
    });
  }, [changelogEntries]);

  const formatFieldValue = (field: RequestChangelogResponse["field"], value: string | null) => {
    if (value === null) {
      return "empty";
    }

    if (field === "status") {
      return value
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
    }

    if (field === "isPinned" || field === "isHidden") {
      return value === "true" ? "Yes" : "No";
    }

    return value;
  };

  const formatRelativeTime = (timestamp: string | null) => {
    if (!timestamp) {
      return "just now";
    }

    return formatLocalizedDateTimeWithClock(timestamp);
  };

  const formatDisplayName = (displayName: string | null) => {
    if (!displayName) {
      return "Unknown user";
    }

    return displayName;
  };

  const getInitials = (displayName: string | null) => {
    const normalized = formatDisplayName(displayName);
    const chunks = normalized
      .split(" ")
      .map((chunk) => chunk.trim())
      .filter(Boolean);

    if (chunks.length === 0) {
      return "U";
    }

    if (chunks.length === 1) {
      return chunks[0].slice(0, 2).toUpperCase();
    }

    return `${chunks[0][0] ?? ""}${chunks[1][0] ?? ""}`.toUpperCase();
  };

  const getStatusColor = (status: string) => {
    return getRequestStatusColor(status);
  };

  const getStatusIcon = (status: string) => {
    return getRequestStatusIcon(status, "size-3");
  };

  const formatStatusLabel = (status: string | null) => {
    return formatRequestStatusLabel(status);
  };

  const renderStatusBadge = (status: string | null) => {
    if (!status) {
      return <span className="text-xs font-medium text-muted-foreground">None</span>;
    }

    return (
      <Badge variant="outline" className={cn("gap-1.5 px-2 py-0.5 text-[11px] font-semibold", getStatusColor(status))}>
        {getStatusIcon(status)}
        <span>{formatStatusLabel(status)}</span>
      </Badge>
    );
  };

  const parseCategoryIds = (value: string | null): string[] => {
    if (!value) {
      return [];
    }

    return value
      .split(",")
      .map((categoryId) => categoryId.trim())
      .filter(Boolean);
  };

  const formatCategoryList = (value: string | null): string => {
    const categoryNames = parseCategoryIds(value).map(
      (categoryId) => categoryNamesById[categoryId] ?? "Deleted category"
    );

    if (categoryNames.length === 0) {
      return "none";
    }

    return categoryNames.join(", ");
  };

  const formatFieldLabel = (field: RequestChangelogResponse["field"]) => {
    switch (field) {
      case "categoryIds":
        return "Categories";
      case "isPinned":
        return "Pinned";
      case "isHidden":
        return "Hidden";
      case "voteCount":
        return "Votes";
      case "adminNote":
        return "Admin note";
      case "status":
        return "Status";
      default:
        return field.charAt(0).toUpperCase() + field.slice(1);
    }
  };

  const renderFieldChange = ({
    label,
    oldValue,
    newValue,
    oldNode,
    newNode
  }: {
    label: string;
    oldValue?: string | null;
    newValue?: string | null;
    oldNode?: ReactNode;
    newNode?: ReactNode;
  }): ReactNode => {
    const oldText = oldValue ?? "empty";
    const newText = newValue ?? "empty";

    const oldDisplay = oldNode ?? (
      <span className="min-w-0 break-all wrap-anywhere text-muted-foreground" title={oldValue ?? "empty"}>
        {oldText}
      </span>
    );
    const newDisplay = newNode ?? (
      <span className="min-w-0 break-all wrap-anywhere" title={newValue ?? "empty"}>
        {newText}
      </span>
    );

    return (
      <div className="min-w-0 space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <div className="inline-flex min-w-0 flex-wrap items-center gap-2 text-sm text-foreground/95">
          {oldDisplay}
          <MoveRight className="size-3.5 text-muted-foreground" aria-hidden="true" />
          {newDisplay}
        </div>
      </div>
    );
  };

  const renderAction = (entry: RequestChangelogResponse): ReactNode => {
    const oldValue = entry.oldValue;
    const newValue = entry.newValue;

    const oldFormattedValue =
      entry.field === "categoryIds" ? formatCategoryList(oldValue) : formatFieldValue(entry.field, oldValue);
    const newFormattedValue =
      entry.field === "categoryIds" ? formatCategoryList(newValue) : formatFieldValue(entry.field, newValue);

    switch (entry.field) {
      case "status":
        return renderFieldChange({
          label: formatFieldLabel(entry.field),
          oldNode: renderStatusBadge(oldValue),
          newNode: renderStatusBadge(newValue)
        });
      default:
        return renderFieldChange({
          label: formatFieldLabel(entry.field),
          oldValue: oldFormattedValue,
          newValue: newFormattedValue
        });
    }
  };

  if (changelogLoading) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center px-6 py-10">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (changelogError) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center px-6 py-10 text-center">
        <p className="text-sm text-muted-foreground">{changelogError}</p>
      </div>
    );
  }

  if (changelogEntries.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center px-6 py-10 text-center">
        <p className="text-sm text-muted-foreground">No history yet.</p>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-1 py-1 md:px-2">
      <ul className="space-y-3">
        {sortedChangelogEntries.map((entry) => (
          <li key={entry.id} className="rounded-lg border border-border/60 px-4 py-3 shadow-sm">
            <div className="flex items-start gap-3">
              <Avatar size="sm" className="mt-0.5">
                <AvatarFallback>{getInitials(entry.userDisplayName)}</AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{formatDisplayName(entry.userDisplayName)}</span>
                  <span className="mx-1">-</span>
                  <span>{formatRelativeTime(entry.createdAt)}</span>
                </p>

                <div>{renderAction(entry)}</div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
