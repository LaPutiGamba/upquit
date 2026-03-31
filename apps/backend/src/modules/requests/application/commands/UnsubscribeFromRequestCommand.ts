export default class UnsubscribeFromRequestCommand {
  constructor(
    readonly userId: string,
    readonly requestId: string
  ) {}
}
