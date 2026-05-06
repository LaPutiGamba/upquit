import ApplicationException from "../../../../shared/application/exceptions/ApplicationException.js";

export default class GiveToGetProgressNotFoundException extends ApplicationException {
  public readonly statusCode = 404;
  public readonly errorCode = "GIVE_TO_GET_PROGRESS_NOT_FOUND";

  constructor(identifier: string) {
    super(`Give-to-Get progress not found: ${identifier}`);
  }
}
