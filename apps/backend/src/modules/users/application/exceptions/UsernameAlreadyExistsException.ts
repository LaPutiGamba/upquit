import ApplicationException from "../../../../shared/application/exceptions/ApplicationException.js";

export default class UsernameAlreadyExistsException extends ApplicationException {
  constructor(username: string) {
    super(`Username ${username} already exists`);
  }
}
