import Uuid from "../../../../shared/domain/value-objects/Uuid.js";

export default class GiveToGetProgress {
  constructor(
    public readonly id: Uuid,
    public readonly userId: Uuid,
    public readonly boardId: Uuid,
    public votesGiven: number | null,
    public qualifyingComments: number | null,
    public canPost: boolean | null,
    public unlockedAt: Date | null
  ) {}
}
