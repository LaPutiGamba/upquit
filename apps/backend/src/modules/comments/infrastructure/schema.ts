import { boolean, AnyPgColumn, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "../../users/infrastructure/schema";
import { requests } from "../../requests/infrastructure/schema";

export const comments = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  requestId: uuid("request_id")
    .notNull()
    .references(() => requests.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  parentId: uuid("parent_id").references((): AnyPgColumn => comments.id),
  content: text("content").notNull(),
  isAdminReply: boolean("is_admin_reply").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});
