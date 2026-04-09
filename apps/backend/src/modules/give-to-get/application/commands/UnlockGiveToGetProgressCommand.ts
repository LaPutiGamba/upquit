export default class UnlockGiveToGetProgressCommand {
  constructor(
    readonly progressId: string,
    readonly userId: string
  ) {}
}
