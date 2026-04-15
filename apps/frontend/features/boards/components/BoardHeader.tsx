import { BoardResponse } from "../services/boardService";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";

interface BoardHeaderProps {
  board: BoardResponse;
}

export function BoardHeader({ board }: BoardHeaderProps) {
  const fallbackLetter = board.name.charAt(0).toUpperCase();

  return (
    <header className="flex items-start gap-4 border-b pb-5">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar className="size-11 border border-border/80 md:size-12">
          {board.logoUrl && <AvatarImage src={board.logoUrl} alt={board.name} />}
          <AvatarFallback className="text-sm font-semibold">{fallbackLetter}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="truncate text-2xl font-semibold tracking-tight">{board.name}</h1>
          {board.description && <p className="text-sm text-muted-foreground line-clamp-2">{board.description}</p>}
        </div>
      </div>
    </header>
  );
}
