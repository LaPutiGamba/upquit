export default class SubscribeToRequestCommand {
  constructor(
    readonly userId: string,
    readonly requestId: string
  ) {}
}
