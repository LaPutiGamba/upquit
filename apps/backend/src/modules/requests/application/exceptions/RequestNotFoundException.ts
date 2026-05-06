import ApplicationException from "../../../../shared/application/exceptions/ApplicationException.js";

export default class RequestNotFoundException extends ApplicationException {
  public readonly statusCode = 404;
  public readonly errorCode = "REQUEST_NOT_FOUND";

  constructor(identifier: string) {
    super(`Request not found: ${identifier}`);
  }
}
