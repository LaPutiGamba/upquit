export default class AuthenticateByOAuthQuery {
  constructor(
    public readonly provider: string,
    public readonly oauthId: string
  ) {}
}
