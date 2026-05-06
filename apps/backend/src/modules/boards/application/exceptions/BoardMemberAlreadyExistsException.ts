import ApplicationException from "../../../../shared/application/exceptions/ApplicationException.js";

export default class BoardMemberAlreadyExistsException extends ApplicationException {
  public readonly statusCode = 409;
  public readonly errorCode = "BOARD_MEMBER_ALREADY_EXISTS";

  constructor(userId: string, boardId: string) {
    super(`User ${userId} is already a member of board ${boardId}`);
  }
}
