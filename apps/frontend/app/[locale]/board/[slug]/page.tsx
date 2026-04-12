import { BoardPageContent } from "@/features/boards/components/BoardPageContent";

interface BoardPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { slug } = await params;
  return <BoardPageContent slug={slug} />;
}
