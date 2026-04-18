"use client";

import { cva } from "class-variance-authority";
import { useState } from "react";
import { CalendarDays, CheckCircle2, Circle, CircleDot, Clock3, XCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import type { RequestStatusValue } from "@/features/requests/services/requestService";
import { UpvoteButton } from "@/features/votes/components/UpvoteButton";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/shared/components/ui/select";
import { formatLocalizedDateTime } from "@/shared/lib/date";
import { cn } from "@/shared/lib/utils";

type RequestMetadata = {
  id: string;
  status: string;
  createdAt?: string | Date | null;
  voteCount?: number | null;
};

interface RequestMetadataRowProps {
  request: RequestMetadata;
  boardId: string;
  canEdit?: boolean;
  onStatusSave?: (nextStatus: RequestStatusValue) => Promise<void> | void;
  stopPropagation?: boolean;
  size: "sm" | "md";
  className?: string;
}

const STATUS_OPTIONS: Array<{ value: RequestStatusValue; label: string }> = [
  { value: "open", label: "Open" },
  { value: "planned", label: "Planned" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "rejected", label: "Rejected" }
];

function getStatusOptionClass(status: RequestStatusValue) {
  switch (status) {
    case "open":
      return "border-muted-foreground/25 bg-muted/35 text-muted-foreground data-[state=checked]:bg-muted/55 data-[state=checked]:text-foreground hover:bg-muted/45";
    case "planned":
      return "border-primary/30 bg-primary/8 text-primary data-[state=checked]:bg-primary/12 data-[state=checked]:text-primary hover:bg-primary/10";
    case "in_progress":
      return "border-chart-2/30 bg-chart-2/8 text-chart-2 data-[state=checked]:bg-chart-2/12 data-[state=checked]:text-chart-2 hover:bg-chart-2/10";
    case "completed":
      return "border-chart-1/30 bg-chart-1/8 text-chart-1 data-[state=checked]:bg-chart-1/12 data-[state=checked]:text-chart-1 hover:bg-chart-1/10";
    case "rejected":
      return "border-destructive/30 bg-destructive/8 text-destructive data-[state=checked]:bg-destructive/12 data-[state=checked]:text-destructive hover:bg-destructive/10";
    default:
      return "";
  }
}

function getStatusOptionLabel(status: RequestStatusValue) {
  return status.replace("_", " ").toUpperCase();
}

const metadataRowVariants = cva("flex flex-wrap items-center", {
  variants: {
    size: {
      sm: "gap-2",
      md: "gap-2.5"
    }
  },
  defaultVariants: {
    size: "sm"
  }
});

const metadataBadgeVariants = cva("inline-flex items-center rounded-full border font-semibold leading-none", {
  variants: {
    size: {
      sm: "h-6 px-2.5 text-[10px]",
      md: "h-7 px-3 text-[11px]"
    }
  },
  defaultVariants: {
    size: "sm"
  }
});

const metadataBadgeContentVariants = cva("", {
  variants: {
    size: {
      sm: "gap-1.5",
      md: "gap-1.75"
    }
  },
  defaultVariants: {
    size: "sm"
  }
});

const metadataIconVariants = cva("shrink-0", {
  variants: {
    size: {
      sm: "size-2.5",
      md: "size-3"
    }
  },
  defaultVariants: {
    size: "sm"
  }
});

const upvoteButtonVariants = cva("rounded-full py-0", {
  variants: {
    size: {
      sm: "h-6 px-2.5 [&>span]:gap-1.5 [&>span>svg]:size-2.5 [&>span>span]:text-[10px]",
      md: "h-7 px-3 [&>span]:gap-1.75 [&>span>svg]:size-4 [&>span>span]:text-xs"
    }
  },
  defaultVariants: {
    size: "sm"
  }
});

export function getStatusLabel(status: string, t: (key: string) => string) {
  const normalized = status.toLowerCase();

  switch (normalized) {
    case "planned":
    case "in_progress":
    case "completed":
    case "rejected":
      try {
        return t(`status.${normalized}`);
      } catch {
        return status.replace("_", " ");
      }
    default:
      return status.replace("_", " ");
  }
}

export function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "open":
      return "border-muted-foreground/35 bg-muted/45 text-muted-foreground";
    case "planned":
      return "border-primary/35 bg-primary/10 text-primary";
    case "in_progress":
      return "border-chart-2/35 bg-chart-2/12 text-chart-2";
    case "completed":
      return "border-chart-1/35 bg-chart-1/12 text-chart-1";
    case "rejected":
      return "border-destructive/35 bg-destructive/10 text-destructive";
    default:
      return "";
  }
}

export function getStatusIcon(status: string, className: string) {
  switch (status.toLowerCase()) {
    case "open":
      return <CircleDot aria-hidden="true" strokeWidth={2.5} className={className} />;
    case "planned":
      return <Circle aria-hidden="true" strokeWidth={2.5} className={className} />;
    case "in_progress":
      return <Clock3 aria-hidden="true" strokeWidth={2.5} className={className} />;
    case "completed":
      return <CheckCircle2 aria-hidden="true" strokeWidth={2.5} className={className} />;
    case "rejected":
      return <XCircle aria-hidden="true" strokeWidth={2.5} className={className} />;
    default:
      return <Circle aria-hidden="true" strokeWidth={2.5} className={className} />;
  }
}

export function RequestMetadataRow({
  request,
  boardId,
  canEdit = false,
  onStatusSave,
  stopPropagation = false,
  size,
  className
}: RequestMetadataRowProps) {
  const t = useTranslations("RequestCard");
  const locale = useLocale();
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const requestDateLabel = request.createdAt ? formatLocalizedDateTime(request.createdAt, locale) : "";

  const handleStatusSave = async (nextStatus: string) => {
    if (!onStatusSave) {
      setIsEditingStatus(false);
      setIsSelectOpen(false);
      return;
    }

    if (nextStatus === request.status) {
      setIsEditingStatus(false);
      setIsSelectOpen(false);
      return;
    }

    setIsSavingStatus(true);
    try {
      await onStatusSave(nextStatus as RequestStatusValue);
    } finally {
      setIsSavingStatus(false);
      setIsEditingStatus(false);
      setIsSelectOpen(false);
    }
  };

  return (
    <div className={cn(metadataRowVariants({ size }), className)}>
      {canEdit && isEditingStatus ? (
        <div onClick={stopPropagation ? (event) => event.stopPropagation() : undefined}>
          <Select
            open={isSelectOpen}
            onOpenChange={(open) => {
              setIsSelectOpen(open);
              if (!open && !isSavingStatus) {
                setIsEditingStatus(false);
              }
            }}
            value={request.status}
            onValueChange={(value) => void handleStatusSave(value)}
          >
            <SelectTrigger
              showIndicator={false}
              className={cn(
                metadataBadgeVariants({ size }),
                metadataBadgeContentVariants({ size }),
                "uppercase tracking-[0.08em]",
                getStatusColor(request.status)
              )}
              disabled={isSavingStatus}
              aria-label="Select request status"
            >
              <span className={cn("inline-flex items-center", metadataBadgeContentVariants({ size }))}>
                {getStatusIcon(request.status, metadataIconVariants({ size }))}
                <SelectValue>{getStatusLabel(request.status, t).toUpperCase()}</SelectValue>
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {STATUS_OPTIONS.map((statusOption) => (
                  <SelectItem
                    key={statusOption.value}
                    value={statusOption.value}
                    showIndicator={false}
                    leadingIcon={getStatusIcon(statusOption.value, metadataIconVariants({ size }))}
                    className={cn(
                      "mx-1 my-1 flex h-7 w-auto items-center rounded-full px-3 py-0 text-[11px] uppercase tracking-[0.08em]",
                      getStatusOptionClass(statusOption.value)
                    )}
                  >
                    <span className="truncate">{getStatusOptionLabel(statusOption.value)}</span>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      ) : (
        <span
          className={cn(
            metadataBadgeVariants({ size }),
            metadataBadgeContentVariants({ size }),
            "uppercase tracking-[0.08em]",
            getStatusColor(request.status),
            canEdit && "cursor-pointer transition-opacity hover:opacity-90"
          )}
          role={canEdit ? "button" : undefined}
          tabIndex={canEdit ? 0 : undefined}
          aria-label={canEdit ? "Edit request status" : undefined}
          onClick={
            canEdit
              ? (event) => {
                  if (stopPropagation) {
                    event.stopPropagation();
                  }
                  setIsEditingStatus(true);
                  setIsSelectOpen(true);
                }
              : undefined
          }
          onKeyDown={
            canEdit
              ? (event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    if (stopPropagation) {
                      event.stopPropagation();
                    }
                    setIsEditingStatus(true);
                    setIsSelectOpen(true);
                  }
                }
              : undefined
          }
        >
          {getStatusIcon(request.status, metadataIconVariants({ size }))}
          {getStatusLabel(request.status, t)}
        </span>
      )}

      {requestDateLabel ? (
        <span
          className={cn(
            metadataBadgeVariants({ size }),
            metadataBadgeContentVariants({ size }),
            "border-border/70 bg-muted/40 text-muted-foreground tracking-[0.04em]"
          )}
        >
          <CalendarDays aria-hidden="true" strokeWidth={2.5} className={metadataIconVariants({ size })} />
          {requestDateLabel}
        </span>
      ) : null}

      <div className="shrink-0" onClick={stopPropagation ? (event) => event.stopPropagation() : undefined}>
        <UpvoteButton
          requestId={request.id}
          boardId={boardId}
          initialVoteCount={request.voteCount ?? 0}
          className={upvoteButtonVariants({ size })}
        />
      </div>
    </div>
  );
}
