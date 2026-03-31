import BoardMember from "../../domain/entities/BoardMember.js";

export default interface BoardMemberResponse {
  userId: string;
  boardId: string;
  role: string;
  createdAt: Date | null;
}

export function mapBoardMemberToResponse(member: BoardMember): BoardMemberResponse {
  return {
    userId: member.userId.getValue(),
    boardId: member.boardId.getValue(),
    role: member.role,
    createdAt: member.createdAt
  };
}
