import { boardService } from "@/features/boards/services/boardService";

const DEFAULT_REDIRECT_PATH = "/boards";

export async function resolveAuthenticatedRedirectPath(): Promise<string> {
  const boards = await boardService.getMyBoards();

  if (boards.length === 1) {
    return `/board/${boards[0].slug}`;
  }

  return DEFAULT_REDIRECT_PATH;
}
