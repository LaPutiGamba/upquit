import ApplicationException from "../../../../shared/application/exceptions/ApplicationException.js";

export default class UserAlreadyExistsException extends ApplicationException {
  constructor(email: string) {
    super(`User with email ${email} already exists`);
  }
}
