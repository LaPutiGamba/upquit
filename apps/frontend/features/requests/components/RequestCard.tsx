import { RequestResponse } from "../services/requestService";
import { UpvoteButton } from "@/features/votes/components/UpvoteButton";
import { Card, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { useTranslations } from "next-intl";

interface RequestCardProps {
  request: RequestResponse;
}

export function RequestCard({ request }: RequestCardProps) {
  const t = useTranslations("RequestCard");

  const getStatusLabel = (status: string) => {
    const normalized = status.toLowerCase();

    switch (normalized) {
      case "planned":
      case "in_progress":
      case "completed":
      case "rejected":
        return t(`status.${normalized}`);
      default:
        return status.replace("_", " ");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "planned":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
      case "in_progress":
        return "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20";
      case "completed":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case "rejected":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <Card className="hover:bg-muted/50 transition-colors cursor-pointer flex flex-row items-start p-4 gap-4">
      <div className="shrink-0 mt-1">
        <UpvoteButton requestId={request.id} boardId={request.boardId} initialVoteCount={request.voteCount ?? 0} />
      </div>

      <div className="flex flex-col gap-2 flex-grow">
        <div className="flex justify-between items-start gap-4">
          <CardTitle className="text-xl leading-tight m-0">{request.title}</CardTitle>
          <Badge variant="outline" className={getStatusColor(request.status)}>
            {getStatusLabel(request.status)}
          </Badge>
        </div>
        <p className="text-muted-foreground line-clamp-2 text-sm">{request.description}</p>
      </div>
    </Card>
  );
}
