import ApplicationException from "../../../../shared/application/exceptions/ApplicationException.js";

export default class AuthorNotFoundException extends ApplicationException {
  public readonly statusCode = 404;
  public readonly errorCode = "AUTHOR_NOT_FOUND";

  constructor(identifier: string) {
    super(`Request author not found: ${identifier}`);
  }
}
