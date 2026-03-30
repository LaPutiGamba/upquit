import Uuid from "../../../../shared/domain/value-objects/Uuid.js";

export default class GiveToGetProgress {
  constructor(
    id: string,
    userId: string,
    boardId: string,
    public readonly votesGiven: number | null,
    public readonly qualifyingComments: number | null,
    public readonly canPost: boolean | null,
    public readonly unlockedAt: Date | null
  ) {
    this.id = new Uuid(id);
    this.userId = new Uuid(userId);
    this.boardId = new Uuid(boardId);
  }

  public readonly id: Uuid;
  public readonly userId: Uuid;
  public readonly boardId: Uuid;
}
