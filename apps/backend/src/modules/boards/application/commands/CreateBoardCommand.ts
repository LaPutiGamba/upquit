export default class CreateBoardCommand {
  constructor(
    readonly slug: string,
    readonly name: string,
    readonly ownerId: string,
    readonly description: string | null = null,
    readonly logoUrl: string | null = null,
    readonly primaryColor: string | null = null,
    readonly isPublic: boolean | null = null,
    readonly allowAnonymousVotes: boolean | null = null,
    readonly giveToGetEnabled: boolean | null = null,
    readonly giveToGetVotesReq: number | null = null,
    readonly giveToGetCommentsReq: number | null = null
  ) {}
}
