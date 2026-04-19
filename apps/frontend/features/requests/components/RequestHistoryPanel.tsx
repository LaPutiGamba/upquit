"use client";

import { useMemo, type ReactNode } from "react";
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
}

export function RequestHistoryPanel({ changelogEntries, changelogLoading, changelogError }: RequestHistoryPanelProps) {
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

  const renderAction = (entry: RequestChangelogResponse): ReactNode => {
    const oldValue = entry.oldValue;
    const newValue = entry.newValue;

    switch (entry.field) {
      case "status":
        return (
          <span className="inline-flex flex-wrap items-center gap-2 text-sm">
            <span>Changed status from</span>
            {renderStatusBadge(oldValue)}
            <span>to</span>
            {renderStatusBadge(newValue)}
          </span>
        );
      case "title":
        if (!oldValue || oldValue === "empty") {
          return <span>Set the title to &quot;{formatFieldValue(entry.field, newValue)}&quot;.</span>;
        }
        return (
          <span>
            Renamed this request from &quot;{formatFieldValue(entry.field, oldValue)}&quot; to &quot;
            {formatFieldValue(entry.field, newValue)}&quot;.
          </span>
        );
      case "description":
        if (newValue === null) {
          return <span>Cleared the description.</span>;
        }
        if (oldValue === null) {
          return <span>Set the description to &quot;{formatFieldValue(entry.field, newValue)}&quot;.</span>;
        }
        return (
          <span>
            Changed the description from &quot;{formatFieldValue(entry.field, oldValue)}&quot; to &quot;
            {formatFieldValue(entry.field, newValue)}&quot;.
          </span>
        );
      case "isPinned":
        return <span>{newValue === "true" ? "Pinned this request." : "Unpinned this request."}</span>;
      case "isHidden":
        return <span>{newValue === "true" ? "Marked this request as hidden." : "Made this request visible."}</span>;
      case "adminNote":
        if (newValue === null) {
          return <span>Removed the admin note.</span>;
        }
        if (oldValue === null) {
          return <span>Added an admin note.</span>;
        }
        return <span>Updated the admin note.</span>;
      case "voteCount":
        return (
          <span>
            Adjusted vote count from {formatFieldValue(entry.field, oldValue)} to{" "}
            {formatFieldValue(entry.field, newValue)}.
          </span>
        );
      case "categoryId":
        return <span>Changed the category for this request.</span>;
      default:
        return (
          <span>
            Updated {entry.field} from {formatFieldValue(entry.field, oldValue)} to{" "}
            {formatFieldValue(entry.field, newValue)}.
          </span>
        );
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

                <div className="text-sm font-medium text-foreground/95">{renderAction(entry)}</div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
