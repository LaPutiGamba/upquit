import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import Email from "../value-objects/Email.js";

export default class User {
  constructor(
    id: string,
    email: string,
    public readonly displayName: string,
    public readonly passwordHash: string | null,
    public readonly avatarUrl: string | null,
    public readonly emailVerified: boolean,
    public readonly oauthProvider: string | null,
    public readonly oauthId: string | null,
    public readonly isActive: boolean,
    public readonly createdAt: Date | null
  ) {
    this.id = new Uuid(id);
    this.email = new Email(email);
  }

  public readonly id: Uuid;
  public readonly email: Email;
}
