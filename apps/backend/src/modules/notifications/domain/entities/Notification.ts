export default class Notification {
  id: string;
  userId: string;
  boardId?: string | null;
  type: string;
  payload: any;
  read: boolean;
  createdAt: string;

  constructor({
    id,
    userId,
    boardId = null,
    type,
    payload,
    read = false,
    createdAt
  }: {
    id: string;
    userId: string;
    boardId?: string | null;
    type: string;
    payload: any;
    read?: boolean;
    createdAt?: string;
  }) {
    this.id = id;
    this.userId = userId;
    this.boardId = boardId ?? null;
    this.type = type;
    this.payload = payload;
    this.read = read ?? false;
    this.createdAt = createdAt ?? new Date().toISOString();
  }
}
