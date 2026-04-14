import { BoardResponse } from "../services/boardService";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";

interface BoardHeaderProps {
  board: BoardResponse;
}

export function BoardHeader({ board }: BoardHeaderProps) {
  const fallbackLetter = board.name.charAt(0).toUpperCase();

  return (
    <header className="flex items-start gap-4 p-5 md:p-6">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar className="h-12 w-12 border">
          {board.logoUrl && <AvatarImage src={board.logoUrl} alt={board.name} />}
          <AvatarFallback className="text-sm font-semibold">{fallbackLetter}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight truncate">{board.name}</h1>
          {board.description && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{board.description}</p>}
        </div>
      </div>
    </header>
  );
}
