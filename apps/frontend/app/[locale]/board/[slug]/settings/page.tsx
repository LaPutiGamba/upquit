import { BoardSettingsPageContent } from "@/features/boards/components/BoardSettingsPageContent";

interface BoardSettingsPageProps {
  params: Promise<{ slug: string }>;
}

export const metadata = {
  title: "Board Settings",
  description: "Manage board settings and preferences"
};

export default async function BoardSettingsPage({ params }: BoardSettingsPageProps) {
  const { slug } = await params;

  return <BoardSettingsPageContent slug={slug} />;
}
