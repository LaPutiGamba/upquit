import type { Metadata } from "next";
import { NotificationsPageContent } from "@/features/notifications/components/NotificationsPageContent";

export const metadata: Metadata = {
  title: "Notifications",
  description: "View and manage your notifications"
};

export default function NotificationsPage() {
  return <NotificationsPageContent />;
}
