import ApplicationException from "../../../../shared/application/exceptions/ApplicationException.js";

export default class UserNotFoundException extends ApplicationException {
  constructor(identifier: string) {
    super(`User not found: ${identifier}`);
  }
}
