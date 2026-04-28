import { boolean, char, integer, pgTable, primaryKey, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "../../users/infrastructure/schema.js";

export const boards = pgTable("boards", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 63 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  logoUrl: text("logo_url"),
  primaryColor: char("primary_color", { length: 7 }).default("#a6a2eb"),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id),
  isPublic: boolean("is_public").default(false),
  allowAnonymousVotes: boolean("allow_anonymous_votes").default(false),
  giveToGetEnabled: boolean("give_to_get_enabled").default(true),
  giveToGetVotesReq: integer("give_to_get_votes_req").default(2),
  giveToGetCommentsReq: integer("give_to_get_comments_req").default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

export const boardMembers = pgTable(
  "board_members",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    boardId: uuid("board_id")
      .notNull()
      .references(() => boards.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 50 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
  },
  (table) => {
    return [primaryKey({ columns: [table.userId, table.boardId] })];
  }
);

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  boardId: uuid("board_id")
    .notNull()
    .references(() => boards.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});
