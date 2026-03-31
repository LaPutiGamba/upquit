export default class GiveToGetProgressAlreadyExistsException extends Error {
  constructor(userId: string, boardId: string) {
    super(`Give-to-get progress already exists for user ${userId} and board ${boardId}`);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
