import ApplicationException from "./ApplicationException.js";

export default class UnauthorizedActionException extends ApplicationException {
  constructor(message: string = "You do not have permission to perform this action") {
    super(message);
    this.name = "UnauthorizedActionException";
  }
}
