import ApplicationException from "../../../../shared/application/exceptions/ApplicationException.js";

export default class BoardMemberNotFoundException extends ApplicationException {
  public readonly statusCode = 404;
  public readonly errorCode = "BOARD_MEMBER_NOT_FOUND";

  constructor(userId: string, boardId: string) {
    super(`User ${userId} is not a member of board ${boardId}`);
  }
}
