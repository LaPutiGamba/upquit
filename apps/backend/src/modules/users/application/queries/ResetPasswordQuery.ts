export default class ResetPasswordQuery {
  constructor(
    readonly token: string,
    readonly newPassword: string
  ) {}
}
