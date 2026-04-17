"use client";

import { cva } from "class-variance-authority";
import { CalendarDays, CheckCircle2, Circle, CircleDot, Clock3, XCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { UpvoteButton } from "@/features/votes/components/UpvoteButton";
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
  stopPropagation?: boolean;
  size: "sm" | "md";
  className?: string;
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
  stopPropagation = false,
  size,
  className
}: RequestMetadataRowProps) {
  const t = useTranslations("RequestCard");
  const locale = useLocale();

  const requestDateLabel = request.createdAt ? formatLocalizedDateTime(request.createdAt, locale) : "";

  return (
    <div className={cn(metadataRowVariants({ size }), className)}>
      <span
        className={cn(
          metadataBadgeVariants({ size }),
          metadataBadgeContentVariants({ size }),
          "uppercase tracking-[0.08em]",
          getStatusColor(request.status)
        )}
      >
        {getStatusIcon(request.status, metadataIconVariants({ size }))}
        {getStatusLabel(request.status, t)}
      </span>

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
