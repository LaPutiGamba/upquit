import { BoardResponse } from "../services/boardService";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";

interface BoardHeaderProps {
  board: BoardResponse;
}

export function BoardHeader({ board }: BoardHeaderProps) {
  const fallbackLetter = board.name.charAt(0).toUpperCase();

  return (
    <header className="flex items-center gap-4 py-8 border-b">
      <Avatar className="h-16 w-16 border shadow-sm">
        {board.logoUrl && <AvatarImage src={board.logoUrl} alt={board.name} />}
        <AvatarFallback className="text-xl font-bold">{fallbackLetter}</AvatarFallback>
      </Avatar>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{board.name}</h1>
        {board.description && <p className="text-muted-foreground mt-1 text-lg">{board.description}</p>}
      </div>
    </header>
  );
}
