import { CheckCircle2, Circle, CircleDot, Clock3, XCircle } from "lucide-react";

export function getRequestStatusLabel(status: string, t?: (key: string) => string) {
  const normalized = status.toLowerCase();

  if (t && normalized !== "open") {
    try {
      return t(`status.${normalized}`);
    } catch {
      return status.replace("_", " ");
    }
  }

  return status.replace("_", " ");
}

export function formatRequestStatusLabel(status: string | null) {
  if (!status) {
    return "None";
  }

  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getRequestStatusColor(status: string) {
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
      return "border-border/60 bg-muted/30 text-muted-foreground";
  }
}

export function getRequestStatusIcon(status: string, className: string) {
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
