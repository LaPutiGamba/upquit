import { boolean, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  avatarUrl: text("avatar_url"),
  emailVerified: boolean("email_verified").default(false),
  oauthProvider: varchar("oauth_provider", { length: 50 }),
  oauthId: varchar("oauth_id", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  isActive: boolean("is_active").default(true)
});
