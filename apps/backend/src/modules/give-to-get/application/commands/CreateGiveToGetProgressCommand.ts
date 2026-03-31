export default class CreateGiveToGetProgressCommand {
  constructor(
    readonly userId: string,
    readonly boardId: string,
    readonly votesGiven: number | null = 0,
    readonly qualifyingComments: number | null = 0,
    readonly canPost: boolean | null = false,
    readonly unlockedAt: Date | null = null
  ) {}
}
