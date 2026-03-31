export default class CreateUserCommand {
  constructor(
    readonly email: string,
    readonly displayName: string,
    readonly passwordHash: string | null = null,
    readonly oauthProvider: string | null = null,
    readonly oauthId: string | null = null,
    readonly avatarUrl: string | null = null
  ) {}
}
