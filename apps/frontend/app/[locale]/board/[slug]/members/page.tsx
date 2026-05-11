import { BoardMembersPageContent } from "@/features/boards/components/BoardMembersPageContent";

interface BoardMembersPageProps {
  params: Promise<{ slug: string }>;
}

export const metadata = {
  title: "Board Members",
  description: "Manage board members and their roles"
};

export default async function BoardMembersPage({ params }: BoardMembersPageProps) {
  const { slug } = await params;
  return <BoardMembersPageContent slug={slug} />;
}
