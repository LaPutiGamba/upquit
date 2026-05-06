import ApplicationException from "../../../../shared/application/exceptions/ApplicationException.js";

export default class GiveToGetProgressAlreadyExistsException extends ApplicationException {
  public readonly statusCode = 409;
  public readonly errorCode = "GIVE_TO_GET_PROGRESS_ALREADY_EXISTS";

  constructor(userId: string, boardId: string) {
    super(`Give-to-Get progress already exists for user ${userId} on board ${boardId}`);
  }
}
