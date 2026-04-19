import { BoardSettingsPageContent } from "@/features/boards/components/BoardSettingsPageContent";

interface BoardSettingsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BoardSettingsPage({ params }: BoardSettingsPageProps) {
  const { slug } = await params;

  return <BoardSettingsPageContent slug={slug} />;
}
