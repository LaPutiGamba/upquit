import { RequestDetailPageContent } from "@/features/requests/components/RequestDetailPageContent";

interface RequestDetailPageProps {
  params: Promise<{ slug: string; id: string }>;
}

export default async function RequestDetailPage({ params }: RequestDetailPageProps) {
  const { slug, id } = await params;
  return <RequestDetailPageContent slug={slug} id={id} />;
}
