export default class GiveToGetProgressNotFoundException extends Error {
  constructor(identifier: string) {
    super(`Give-to-get progress not found: ${identifier}`);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
