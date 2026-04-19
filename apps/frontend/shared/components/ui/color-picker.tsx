"use client";

import { cn } from "@/shared/lib/utils";

interface ColorPickerProps {
  value: string | undefined;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

const COLORS = [
  { name: "Zinc", hex: "#a1a1aa" },
  { name: "Slate", hex: "#94a3b8" },
  { name: "Olive", hex: "#94a599" },
  { name: "Mist", hex: "#8da5a9" },
  { name: "Red", hex: "#f87171" },
  { name: "Orange", hex: "#fb923c" },
  { name: "Amber", hex: "#fbbf24" },
  { name: "Yellow", hex: "#facc15" },
  { name: "Lime", hex: "#a3e635" },
  { name: "Green", hex: "#4ade80" },
  { name: "Emerald", hex: "#34d399" },
  { name: "Teal", hex: "#2dd4bf" },
  { name: "Cyan", hex: "#22d3ee" },
  { name: "Sky", hex: "#38bdf8" },
  { name: "Blue", hex: "#60a5fa" },
  { name: "Indigo", hex: "#818cf8" },
  { name: "Violet", hex: "#a78bfa" },
  { name: "Purple", hex: "#c084fc" },
  { name: "Fuchsia", hex: "#e879f9" },
  { name: "Pink", hex: "#f472b6" },
  { name: "Rose", hex: "#fb7185" }
];

export function ColorPicker({ value, onChange, disabled = false, className }: ColorPickerProps) {
  return (
    <div className={cn("flex flex-wrap gap-2 md:flex-nowrap", className)}>
      {COLORS.map((color) => (
        <button
          key={color.hex}
          type="button"
          disabled={disabled}
          onClick={() => onChange(color.hex)}
          className={cn(
            "size-8 rounded border-2 transition-all hover:scale-110",
            value === color.hex ? "border-foreground shadow-md" : "border-transparent opacity-70 hover:opacity-100"
          )}
          style={{ backgroundColor: color.hex }}
          title={`${color.name} (${color.hex})`}
        />
      ))}
    </div>
  );
}
