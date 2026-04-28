import { boolean, integer, pgEnum, pgTable, primaryKey, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "../../users/infrastructure/schema.js";
import { boards, categories } from "../../boards/infrastructure/schema.js";

export const requestStatusEnum = pgEnum("request_status", ["open", "planned", "in_progress", "completed", "rejected"]);

export const requests = pgTable("requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  boardId: uuid("board_id")
    .notNull()
    .references(() => boards.id, { onDelete: "cascade" }),
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.id),
  title: varchar("title", { length: 100 }).notNull(),
  description: text("description"),
  status: requestStatusEnum("status").default("open"),
  voteCount: integer("vote_count").default(0),
  isPinned: boolean("is_pinned").default(false),
  isHidden: boolean("is_hidden").default(false),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

export const requestCategories = pgTable(
  "request_categories",
  {
    requestId: uuid("request_id")
      .notNull()
      .references(() => requests.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" })
  },
  (table) => {
    return [primaryKey({ columns: [table.requestId, table.categoryId] })];
  }
);

export const requestChangelogs = pgTable("request_changelogs", {
  id: uuid("id").defaultRandom().primaryKey(),
  requestId: uuid("request_id")
    .notNull()
    .references(() => requests.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  field: varchar("field", { length: 100 }).notNull(),
  oldValue: text("old_value"),
  newValue: text("new_value"),
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
      .references(() => requests.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
  },
  (table) => {
    return [primaryKey({ columns: [table.userId, table.requestId] })];
  }
);
