"use client";

import { cva, type VariantProps } from "class-variance-authority";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode
} from "react";

import { Link } from "@/localization/i18n/routing";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/shared/lib/utils";

const requestTitleVariants = cva("font-semibold tracking-tight text-foreground", {
  variants: {
    variant: {
      dialog: "text-3xl md:text-3xl",
      page: "text-3xl sm:text-4xl md:text-4xl"
    }
  },
  defaultVariants: {
    variant: "page"
  }
});

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

interface RequestHeaderProps extends VariantProps<typeof requestHeaderVariants> {
  children: ReactNode;
  canEdit?: boolean;
  actions?: ReactNode;
  authorDisplayName?: string | null;
  authorAvatarUrl?: string | null;
  authorUsername?: string | null;
  authorIsActive?: boolean | null;
  className?: string;
}

export function RequestHeader({
  variant = "page",
  canEdit = false,
  actions,
  authorDisplayName,
  authorAvatarUrl,
  authorUsername,
  authorIsActive,
  className,
  children
}: RequestHeaderProps) {
  const authorLabel = authorIsActive === false ? "[Deleted user]" : (authorDisplayName ?? authorUsername);
  const isAuthorLinkable = Boolean(authorUsername && authorIsActive !== false);

  return (
    <div className={cn(requestHeaderVariants({ variant }), "flex flex-col gap-4", className)} data-can-edit={canEdit}>
      <div className={cn("flex min-h-8 items-center justify-between gap-4", variant === "dialog" && "pr-35 sm:pr-38")}>
        {authorLabel ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Avatar className="size-6">
              {authorAvatarUrl ? <AvatarImage src={authorAvatarUrl} alt={authorLabel} /> : null}
              <AvatarFallback className="text-[10px] font-semibold uppercase">{authorLabel.charAt(0)}</AvatarFallback>
            </Avatar>
            {isAuthorLinkable ? (
              <Link href={`/users/${authorUsername}`} className="font-medium text-foreground hover:underline">
                {authorLabel}
              </Link>
            ) : (
              <span className="font-medium text-foreground">{authorLabel}</span>
            )}
          </div>
        ) : (
          <div />
        )}

        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>

      <div className="flex min-w-0 flex-col gap-2">{children}</div>
    </div>
  );
}

interface RequestTitleProps extends VariantProps<typeof requestTitleVariants> {
  as?: ElementType;
  children: ReactNode;
  canEdit?: boolean;
  onSave?: (nextTitle: string) => Promise<void> | void;
  className?: string;
}

export function RequestTitle({
  as: Tag = "h1",
  variant = "page",
  children,
  canEdit = false,
  onSave,
  className
}: RequestTitleProps) {
  const initialText = useMemo(() => {
    if (typeof children === "string") return children;
    return String(children ?? "");
  }, [children]);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [value, setValue] = useState(initialText);

  useEffect(() => {
    if (!isEditing) setValue(initialText);
  }, [initialText, isEditing]);

  const commitTitle = async () => {
    const nextTitle = value.trim();
    setIsEditing(false);

    if (!nextTitle || nextTitle === initialText || !onSave) {
      setValue(initialText);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(nextTitle);
    } catch {
      setValue(initialText);
    } finally {
      setIsSaving(false);
    }
  };

  if (canEdit) {
    return (
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onFocus={() => setIsEditing(true)}
        onBlur={() => void commitTitle()}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            event.currentTarget.blur();
          }
          if (event.key === "Escape") {
            event.preventDefault();
            setValue(initialText);
            setIsEditing(false);
            event.currentTarget.blur();
          }
        }}
        isEditing={isEditing}
        disabled={isSaving}
        aria-label="Edit request title"
        className={cn(
          requestTitleVariants({ variant }),
          "h-auto w-[calc(100%+1rem)] -mx-2 px-2 py-1 transition-colors",
          !isEditing &&
            "cursor-pointer border-transparent bg-transparent dark:bg-transparent shadow-none hover:bg-muted/50 dark:hover:bg-muted/40",
          className
        )}
      />
    );
  }

  return (
    <Tag className={cn(requestTitleVariants({ variant }), "w-[calc(100%+1rem)] -mx-2 px-2 py-1", className)}>
      {children}
    </Tag>
  );
}

interface RequestDescriptionProps extends ComponentPropsWithoutRef<"div"> {
  label?: string;
  contentClassName?: string;
  canEdit?: boolean;
  onSave?: (nextDescription: string | null) => Promise<void> | void;
  children?: ReactNode;
}

export function RequestDescription({
  label = "Description",
  className,
  contentClassName,
  canEdit = false,
  onSave,
  children,
  ...props
}: RequestDescriptionProps) {
  const initialText = useMemo(() => {
    if (typeof children === "string") return children;
    if (children === null || children === undefined) return "";
    return String(children);
  }, [children]);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [value, setValue] = useState(initialText);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const adjustHeight = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => {
    if (!isEditing) {
      setValue(initialText);
    }
  }, [initialText, isEditing]);

  useEffect(() => {
    if (textareaRef.current) {
      setTimeout(() => {
        if (textareaRef.current) adjustHeight(textareaRef.current);
      }, 0);
    }
  }, [initialText, isEditing]);

  const commitDescription = async () => {
    const trimmed = value.trim();
    const nextDescription = trimmed.length > 0 ? value : null;
    const previousDescription = initialText.trim().length > 0 ? initialText : null;

    setIsEditing(false);

    if (nextDescription === previousDescription || !onSave) {
      setValue(initialText);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(nextDescription);
    } catch {
      setValue(initialText);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={cn("mt-3", className)} {...props}>
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</p>

      {canEdit ? (
        <Textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            adjustHeight(event.target);
          }}
          onFocus={() => setIsEditing(true)}
          onBlur={() => void commitDescription()}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              setValue(initialText);
              setIsEditing(false);
              event.currentTarget.blur();
            }
          }}
          isEditing={isEditing}
          disabled={isSaving}
          placeholder="Add a description..."
          style={{ minHeight: 0 }}
          className={cn(
            "block w-[calc(100%+1rem)] -mx-2 !min-h-0 resize-none overflow-hidden whitespace-pre-wrap wrap-anywhere px-2 py-1 text-sm leading-7 transition-colors sm:text-base md:text-base",
            !isEditing &&
              "cursor-pointer border-transparent bg-transparent dark:bg-transparent shadow-none hover:bg-muted/50 dark:hover:bg-muted/40",
            contentClassName
          )}
        />
      ) : (
        <p
          className={cn(
            "w-[calc(100%+1rem)] -mx-2 whitespace-pre-wrap wrap-anywhere px-2 py-1 text-sm leading-7 text-foreground/85 sm:text-base md:text-base",
            contentClassName
          )}
        >
          {initialText}
        </p>
      )}
    </div>
  );
}