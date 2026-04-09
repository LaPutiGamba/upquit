export default class UpdateGiveToGetProgressCommand {
  constructor(
    readonly progressId: string,
    readonly userId: string,
    readonly votesGiven?: number | null,
    readonly qualifyingComments?: number | null,
    readonly canPost?: boolean | null,
    readonly unlockedAt?: Date | null
  ) {}
}
