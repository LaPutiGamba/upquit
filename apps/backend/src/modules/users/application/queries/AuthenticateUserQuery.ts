export default class AuthenticateUserQuery {
  constructor(
    readonly email: string,
    readonly password: string
  ) {}
}
