import { RequestDetailPageContent } from "@/features/requests/components/RequestDetailPageContent";

interface RequestDetailPageProps {
  params: Promise<{ slug: string; id: string }>;
}

export const metadata = {
  title: "Request Details",
  description: "View and manage request details"
};

export default async function RequestDetailPage({ params }: RequestDetailPageProps) {
  const { slug, id } = await params;
  return <RequestDetailPageContent slug={slug} id={id} />;
}
