export default class UpdateBoardCommand {
  constructor(
    readonly boardId: string,
    readonly requesterUserId: string,
    readonly slug?: string,
    readonly name?: string,
    readonly description?: string | null,
    readonly logoUrl?: string | null,
    readonly primaryColor?: string | null,
    readonly ownerId?: string,
    readonly isPublic?: boolean | null,
    readonly allowAnonymousVotes?: boolean | null,
    readonly giveToGetEnabled?: boolean | null,
    readonly giveToGetVotesReq?: number | null,
    readonly giveToGetCommentsReq?: number | null
  ) {}
}
