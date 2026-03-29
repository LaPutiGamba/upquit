import { pgTable, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { users } from "../../users/infrastructure/schema";
import { boards } from "../../boards/infrastructure/schema";
import { requests } from "../../requests/infrastructure/schema";

export const votes = pgTable(
  "votes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    requestId: uuid("request_id")
      .notNull()
      .references(() => requests.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    boardId: uuid("board_id")
      .notNull()
      .references(() => boards.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
  },
  (table) => {
    return {
      unq: unique().on(table.requestId, table.userId)
    };
  }
);
