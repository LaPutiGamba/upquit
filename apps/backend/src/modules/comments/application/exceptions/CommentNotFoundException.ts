import ApplicationException from "../../../../shared/application/exceptions/ApplicationException.js";

export default class CommentNotFoundException extends ApplicationException {
  public readonly statusCode = 404;
  public readonly errorCode = "COMMENT_NOT_FOUND";

  constructor(identifier: string) {
    super(`Comment not found: ${identifier}`);
  }
}
