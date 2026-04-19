import type { BoardMemberRecord } from "../../domain/contracts/BoardRepository.js";

export default interface BoardMemberResponse {
  userId: string;
  boardId: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  role: string;
  createdAt: Date | null;
}

export function mapBoardMemberToResponse(member: BoardMemberRecord): BoardMemberResponse {
  return {
    userId: member.userId,
    boardId: member.boardId,
    email: member.email,
    displayName: member.displayName,
    avatarUrl: member.avatarUrl,
    role: member.role,
    createdAt: member.createdAt
  };
}
