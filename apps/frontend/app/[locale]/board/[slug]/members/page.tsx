import { BoardMembersPageContent } from "@/features/boards/components/BoardMembersPageContent";

interface BoardMembersPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BoardMembersPage({ params }: BoardMembersPageProps) {
  const { slug } = await params;
  return <BoardMembersPageContent slug={slug} />;
}
