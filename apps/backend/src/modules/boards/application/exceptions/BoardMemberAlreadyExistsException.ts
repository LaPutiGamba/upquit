export default class BoardMemberAlreadyExistsException extends Error {
  constructor(userId: string, boardId: string) {
    super(`User ${userId} is already a member of board ${boardId}`);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
