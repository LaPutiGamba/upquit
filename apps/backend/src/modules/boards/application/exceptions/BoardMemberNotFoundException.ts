export default class BoardMemberNotFoundException extends Error {
  constructor(userId: string, boardId: string) {
    super(`Member ${userId} was not found on board ${boardId}`);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
