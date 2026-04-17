"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

const requestHeaderVariants = cva("", {
  variants: {
    variant: {
      dialog: "rounded-none border-0 bg-transparent px-0 py-0",
      page: "rounded-xl border border-border/70 bg-linear-to-b from-background via-background to-muted/20 px-5 py-5 sm:px-7 sm:py-6"
    }
  },
  defaultVariants: {
    variant: "page"
  }
});

const requestTitleVariants = cva("text-balance font-semibold tracking-tight text-foreground", {
  variants: {
    variant: {
      dialog: "text-3xl",
      page: "text-3xl sm:text-4xl"
    }
  },
  defaultVariants: {
    variant: "page"
  }
});

interface RequestHeaderProps extends VariantProps<typeof requestHeaderVariants> {
  children: ReactNode;
  className?: string;
}

export function RequestHeader({ variant = "page", className, children }: RequestHeaderProps) {
  return (
    <div className={cn(requestHeaderVariants({ variant }), className)}>
      <div className="flex flex-col gap-2">
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

interface RequestTitleProps extends VariantProps<typeof requestTitleVariants> {
  as?: ElementType;
  children: ReactNode;
  className?: string;
}

export function RequestTitle({ as: Tag = "h1", variant = "page", className, children }: RequestTitleProps) {
  return <Tag className={cn(requestTitleVariants({ variant }), className)}>{children}</Tag>;
}

interface RequestDescriptionProps extends ComponentPropsWithoutRef<"div"> {
  label?: string;
  contentClassName?: string;
  children: ReactNode;
}

export function RequestDescription({
  label = "Description",
  className,
  contentClassName,
  children,
  ...props
}: RequestDescriptionProps) {
  return (
    <div className={cn("mt-6", className)} {...props}>
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
      <p
        className={cn(
          "whitespace-pre-wrap wrap-anywhere text-sm leading-7 text-foreground/85 sm:text-base",
          contentClassName
        )}
      >
        {children}
      </p>
    </div>
  );
}
