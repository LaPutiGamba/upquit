export default class RequestPasswordResetQuery {
  constructor(
    readonly email: string,
    readonly locale: string = "en",
  ) {}
}
