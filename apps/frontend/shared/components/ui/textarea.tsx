import * as React from "react"

import { cn } from "@/shared/lib/utils"

interface TextareaProps extends React.ComponentProps<"textarea"> {
  isEditing?: boolean;
}

function Textarea({ className, isEditing, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex resize-none field-sizing-content min-h-16 w-full rounded-md border border-input bg-transparent px-2.5 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        isEditing && "border-primary focus-visible:border-primary focus-visible:ring-0",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
