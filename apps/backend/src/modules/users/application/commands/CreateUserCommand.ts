export default class CreateUserCommand {
  constructor(
    readonly username: string,
    readonly email: string,
    readonly displayName: string,
    readonly password: string | null = null,
    readonly oauthProvider: string | null = null,
    readonly oauthId: string | null = null,
    readonly avatarUrl: string | null = null
  ) {}
}
