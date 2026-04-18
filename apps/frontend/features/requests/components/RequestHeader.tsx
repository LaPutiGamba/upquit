"use client";

import { cva, type VariantProps } from "class-variance-authority";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ElementType,
  type KeyboardEvent,
  type ReactNode
} from "react";

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
  canEdit?: boolean;
  className?: string;
}

export function RequestHeader({ variant = "page", canEdit = false, className, children }: RequestHeaderProps) {
  return (
    <div className={cn(requestHeaderVariants({ variant }), className)} data-can-edit={canEdit}>
      <div className="flex flex-col gap-2">
        <div className="min-w-0">{children}</div>
      </div>
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
    if (typeof children === "string") {
      return children;
    }

    return String(children ?? "");
  }, [children]);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [value, setValue] = useState(initialText);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isEditing) {
      setValue(initialText);
    }
  }, [initialText, isEditing]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

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

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onBlur={() => void commitTitle()}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            void commitTitle();
          }

          if (event.key === "Escape") {
            event.preventDefault();
            setValue(initialText);
            setIsEditing(false);
          }
        }}
        className={cn(
          requestTitleVariants({ variant }),
          "h-auto w-full rounded-md border border-input bg-background/80 px-2 py-1.5 outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          className
        )}
        disabled={isSaving}
      />
    );
  }

  return (
    <Tag
      className={cn(
        requestTitleVariants({ variant }),
        canEdit && "-mx-2 cursor-text rounded-md px-2 py-1 transition-colors hover:bg-muted/45",
        className
      )}
      onClick={canEdit ? () => setIsEditing(true) : undefined}
      role={canEdit ? "button" : undefined}
      tabIndex={canEdit ? 0 : undefined}
      onKeyDown={
        canEdit
          ? (event: KeyboardEvent<HTMLElement>) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setIsEditing(true);
              }
            }
          : undefined
      }
      aria-label={canEdit ? "Edit request title" : undefined}
    >
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
    if (typeof children === "string") {
      return children;
    }

    if (children === null || children === undefined) {
      return "";
    }

    return String(children);
  }, [children]);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [value, setValue] = useState(initialText);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!isEditing) {
      setValue(initialText);
    }
  }, [initialText, isEditing]);

  useEffect(() => {
    if (!isEditing || !textareaRef.current) {
      return;
    }

    const textarea = textareaRef.current;
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [isEditing]);

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
    <div className={cn("mt-6", className)} {...props}>
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);

            const element = event.currentTarget;
            element.style.height = "auto";
            element.style.height = `${element.scrollHeight}px`;
          }}
          onBlur={() => void commitDescription()}
          className={cn(
            "w-full resize-none overflow-hidden rounded-md border border-input bg-background/80 px-2 py-2 whitespace-pre-wrap wrap-anywhere text-sm leading-7 text-foreground/90 outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:text-base",
            contentClassName
          )}
          disabled={isSaving}
        />
      ) : (
        <p
          className={cn(
            "whitespace-pre-wrap wrap-anywhere text-sm leading-7 text-foreground/85 sm:text-base",
            canEdit && "-mx-2 min-h-7 cursor-text rounded-md px-2 py-1 transition-colors hover:bg-muted/45",
            !initialText.trim() && canEdit && "text-muted-foreground",
            contentClassName
          )}
          onClick={canEdit ? () => setIsEditing(true) : undefined}
          role={canEdit ? "button" : undefined}
          tabIndex={canEdit ? 0 : undefined}
          onKeyDown={
            canEdit
              ? (event: KeyboardEvent<HTMLElement>) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setIsEditing(true);
                  }
                }
              : undefined
          }
          aria-label={canEdit ? "Edit request description" : undefined}
        >
          {initialText.trim() ? initialText : canEdit ? "Add a description..." : ""}
        </p>
      )}
    </div>
  );
}
