export default class DeleteRequestCommand {
  constructor(
    readonly requestId: string,
    readonly requesterUserId: string
  ) {}
}
