import ApplicationException from "../../../../shared/application/exceptions/ApplicationException.js";

export default class BoardAlreadyExistsException extends ApplicationException {
  public readonly statusCode = 409;
  public readonly errorCode = "BOARD_ALREADY_EXISTS";

  constructor(slug: string) {
    super(`Board with slug ${slug} already exists`);
  }
}
