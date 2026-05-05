import ApplicationException from "../../../../shared/application/exceptions/ApplicationException.js";

export default class UserAlreadyDeactivatedException extends ApplicationException {
  constructor(userId: string) {
    super(`User is already deactivated: ${userId}`);
  }
}
