import type { ComponentType } from "react";

export type SidebarItem = {
  id: "dashboard" | "requests";
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};
