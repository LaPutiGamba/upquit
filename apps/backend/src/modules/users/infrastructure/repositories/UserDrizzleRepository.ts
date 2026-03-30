import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { users } from "../schema.js";

import UserRepository from "../../domain/contracts/UserRepository.js";
import User from "../../domain/entities/User.js";
import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import Email from "../../domain/value-objects/Email.js";

export class UserDrizzleRepository implements UserRepository {
  constructor(private readonly db: NodePgDatabase<Record<string, never>>) {}

  public async findById(id: Uuid): Promise<User | null> {
    const [row] = await this.db.select().from(users).where(eq(users.id, id.getValue())).limit(1);

    if (!row) return null;
    return this.mapToDomainUser(row);
  }

  public async findByEmail(email: Email): Promise<User | null> {
    const [row] = await this.db.select().from(users).where(eq(users.email, email.getValue())).limit(1);

    if (!row) return null;
    return this.mapToDomainUser(row);
  }

  public async save(user: User): Promise<void> {
    await this.db.insert(users).values({
      id: user.id.getValue(),
      email: user.email.getValue(),
      passwordHash: user.passwordHash,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerified,
      oauthProvider: user.oauthProvider,
      oauthId: user.oauthId,
      isActive: user.isActive,
      createdAt: user.createdAt
    });
  }

  public async update(user: User): Promise<void> {
    await this.db
      .update(users)
      .set({
        email: user.email.getValue(),
        passwordHash: user.passwordHash,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        emailVerified: user.emailVerified,
        oauthProvider: user.oauthProvider,
        oauthId: user.oauthId,
        isActive: user.isActive
      })
      .where(eq(users.id, user.id.getValue()));
  }

  // =========================================================================
  // MAPPER
  // =========================================================================

  private mapToDomainUser(row: typeof users.$inferSelect): User {
    return new User(
      row.id,
      row.email,
      row.displayName,
      row.passwordHash,
      row.avatarUrl,
      row.emailVerified ?? false,
      row.oauthProvider,
      row.oauthId,
      row.isActive ?? true,
      row.createdAt
    );
  }
}
