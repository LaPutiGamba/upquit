import type { Metadata } from "next";
import { DefaultHomePage } from "@/features/home/components/DefaultHomePage";

export const metadata: Metadata = {
  title: "UpQuit",
  description: "Track ideas, requests, and board activity in one place."
};

export default function Home() {
  return <DefaultHomePage />;
}
