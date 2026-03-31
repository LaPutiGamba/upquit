export default class GetVoteByRequestAndUserQuery {
  constructor(
    readonly requestId: string,
    readonly userId: string
  ) {}
}
