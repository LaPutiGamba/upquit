import { pgTable, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { users } from "../../users/infrastructure/schema.js";
import { boards } from "../../boards/infrastructure/schema.js";
import { requests } from "../../requests/infrastructure/schema.js";

export const votes = pgTable(
  "votes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    requestId: uuid("request_id")
      .notNull()
      .references(() => requests.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    boardId: uuid("board_id")
      .notNull()
      .references(() => boards.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
  },
  (table) => {
    return [unique().on(table.requestId, table.userId)];
  }
);
