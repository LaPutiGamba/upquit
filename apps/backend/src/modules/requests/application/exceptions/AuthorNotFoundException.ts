import ApplicationException from "../../../../shared/application/exceptions/ApplicationException.js";

export default class AuthorNotFoundException extends ApplicationException {
  constructor(identifier: string) {
    super(`Request author not found: ${identifier}`);
  }
}
