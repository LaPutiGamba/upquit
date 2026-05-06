import ApplicationException from "../../../../shared/application/exceptions/ApplicationException.js";

export default class BoardNotFoundException extends ApplicationException {
  public readonly statusCode = 404;
  public readonly errorCode = "BOARD_NOT_FOUND";

  constructor(identifier: string) {
    super(`Board not found: ${identifier}`);
  }
}
