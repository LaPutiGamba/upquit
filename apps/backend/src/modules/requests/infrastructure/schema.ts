import { boolean, integer, pgEnum, pgTable, primaryKey, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "../../users/infrastructure/schema";
import { boards, categories } from "../../boards/infrastructure/schema";

export const requestStatusEnum = pgEnum("request_status", ["open", "planned", "in_progress", "completed", "rejected"]);

export const requests = pgTable("requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  boardId: uuid("board_id")
    .notNull()
    .references(() => boards.id),
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.id),
  categoryId: uuid("category_id").references(() => categories.id),
  title: varchar("title", { length: 100 }).notNull(),
  description: text("description"),
  status: requestStatusEnum("status").default("open"),
  voteCount: integer("vote_count").default(0),
  isPinned: boolean("is_pinned").default(false),
  isHidden: boolean("is_hidden").default(false),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

export const subscriptions = pgTable(
  "subscriptions",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    requestId: uuid("request_id")
      .notNull()
      .references(() => requests.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.userId, table.requestId] })
    };
  }
);
