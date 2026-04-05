import { apiClient } from "@/shared/lib/apiClient";

export interface BoardResponse {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  ownerId: string;
  isPublic: boolean | null;
  allowAnonymousVotes: boolean | null;
  giveToGetEnabled: boolean | null;
  giveToGetVotesReq: number | null;
  giveToGetCommentsReq: number | null;
  createdAt: string | null;
}

export const boardService = {
  getBoardBySlug: async (slug: string): Promise<BoardResponse> => {
    return await apiClient<BoardResponse>(`/boards?slug=${slug}`, {
      method: "GET",
      next: { revalidate: 60 }
    });
  }
};
