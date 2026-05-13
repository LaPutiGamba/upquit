import ApplicationException from "../../../../shared/application/exceptions/ApplicationException.js";

export default class BoardIsPrivateException extends ApplicationException {
  public readonly statusCode = 403;
  public readonly errorCode = "BOARD_IS_PRIVATE";

  constructor(boardId: string) {
    super(`Board ${boardId} is private and cannot be joined directly`);
  }
}
