import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import Email from "../value-objects/Email.js";

export default class User {
  constructor(
    public readonly id: Uuid,
    public email: Email,
    public displayName: string,
    public passwordHash: string | null,
    public avatarUrl: string | null,
    public emailVerified: boolean,
    public oauthProvider: string | null,
    public oauthId: string | null,
    public isActive: boolean,
    public readonly createdAt: Date | null
  ) {}
}
