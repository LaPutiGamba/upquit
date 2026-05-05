import ApplicationException from "../../../../shared/application/exceptions/ApplicationException.js";

export default class InvalidCredentialsException extends ApplicationException {
  constructor() {
    super("Invalid email or password");
  }
}
