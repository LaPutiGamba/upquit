"use client";

import { useLocale, useTranslations } from "next-intl";
import { CalendarDays, CheckCircle2, Circle, CircleDot, Clock3, XCircle } from "lucide-react";

import { UpvoteButton } from "@/features/votes/components/UpvoteButton";
import { cn } from "@/shared/lib/utils";

interface RequestHeaderProps {
  requestId: string;
  boardId: string;
  title: string;
  description?: string | null;
  status: string;
  createdAt?: string | Date | null;
  initialVoteCount: number;
  variant?: "dialog" | "page";
  showDescription?: boolean;
  stopPropagation?: boolean;
  className?: string;
}

function getStatusColor(status: string) {
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

function StatusBadgeIcon({ status }: { status: string }) {
  switch (status.toLowerCase()) {
    case "open":
      return <CircleDot aria-hidden="true" strokeWidth={2.75} />;
    case "planned":
      return <Circle aria-hidden="true" strokeWidth={2.75} />;
    case "in_progress":
      return <Clock3 aria-hidden="true" strokeWidth={2.75} />;
    case "completed":
      return <CheckCircle2 aria-hidden="true" strokeWidth={2.75} />;
    case "rejected":
      return <XCircle aria-hidden="true" strokeWidth={2.75} />;
    default:
      return <Circle aria-hidden="true" strokeWidth={2.75} />;
  }
}

export function RequestHeader({
  requestId,
  boardId,
  title,
  description,
  status,
  createdAt,
  initialVoteCount,
  variant = "page",
  showDescription = true,
  stopPropagation = false,
  className
}: RequestHeaderProps) {
  const t = useTranslations("RequestCard");
  const locale = useLocale();
  const isDialog = variant === "dialog";

  const TitleTag = variant === "page" ? "h1" : "h2";
  const requestDateLabel = createdAt
    ? new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }).format(new Date(createdAt))
    : "";

  const normalizedStatus = status.toLowerCase();
  const badgeBaseClass = isDialog
    ? "inline-flex h-6 items-center rounded-full border px-2.5 text-[10px] font-semibold leading-none"
    : "inline-flex h-7 items-center rounded-full border px-3 text-[11px] font-semibold leading-none";
  const statusLabel =
    normalizedStatus === "planned" ||
    normalizedStatus === "in_progress" ||
    normalizedStatus === "completed" ||
    normalizedStatus === "rejected"
      ? t(`status.${normalizedStatus}`)
      : status.replace("_", " ");

  return (
    <div
      className={cn(
        isDialog
          ? "rounded-none border-0 bg-transparent px-0 py-0"
          : "rounded-xl border border-border/70 bg-linear-to-b from-background via-background to-muted/20 px-5 py-5 sm:px-7 sm:py-6",
        className
      )}
    >
      <div className={cn(isDialog ? "flex flex-col gap-2" : "flex items-start justify-between gap-4")}>
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                badgeBaseClass,
                "gap-1.5 uppercase tracking-[0.08em]",
                isDialog ? "[&_svg]:size-2.5 [&_svg]:shrink-0" : "[&_svg]:size-3 [&_svg]:shrink-0",
                getStatusColor(status)
              )}
            >
              <StatusBadgeIcon status={normalizedStatus} />
              {statusLabel}
            </span>
            {requestDateLabel ? (
              <span
                className={cn(
                  badgeBaseClass,
                  "gap-1.5 border-border/70 bg-muted/40 text-muted-foreground",
                  isDialog
                    ? "tracking-[0.04em] [&_svg]:size-2.5 [&_svg]:shrink-0"
                    : "tracking-[0.04em] [&_svg]:size-3 [&_svg]:shrink-0"
                )}
              >
                <CalendarDays aria-hidden="true" strokeWidth={2.5} />
                {requestDateLabel}
              </span>
            ) : null}

            {isDialog ? (
              <UpvoteButton
                requestId={requestId}
                boardId={boardId}
                initialVoteCount={initialVoteCount}
                className={cn(
                  "h-6 rounded-full px-2.5 py-0",
                  "border-border/70 bg-muted/35 text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  "dark:bg-muted/25 dark:hover:bg-muted/40",
                  "[&>span]:gap-1.5 [&>span>svg]:size-3.5 [&>span>span]:text-[11px]"
                )}
              />
            ) : null}
          </div>

          <TitleTag
            className={cn(
              "text-balance font-semibold tracking-tight text-foreground",
              isDialog ? "text-3xl" : "text-3xl sm:text-4xl"
            )}
          >
            {title}
          </TitleTag>

          {showDescription ? (
            <div className="mt-6">
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Description
              </p>
              <p className="whitespace-pre-wrap wrap-anywhere text-sm leading-7 text-foreground/85 sm:text-base">
                {description ?? ""}
              </p>
            </div>
          ) : null}
        </div>

        {!isDialog ? (
          <div className="shrink-0" onClick={stopPropagation ? (event) => event.stopPropagation() : undefined}>
            <UpvoteButton
              requestId={requestId}
              boardId={boardId}
              initialVoteCount={initialVoteCount}
              className={cn(
                "h-7 rounded-full px-3 py-0",
                "[&>span]:gap-1.75 [&>span>svg]:size-4 [&>span>span]:text-xs"
              )}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
