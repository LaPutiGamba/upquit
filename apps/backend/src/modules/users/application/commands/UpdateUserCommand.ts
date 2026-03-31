export default class UpdateUserCommand {
  constructor(
    readonly userId: string,
    readonly displayName?: string,
    readonly avatarUrl?: string | null,
    readonly emailVerified?: boolean,
    readonly isActive?: boolean
  ) {}
}
