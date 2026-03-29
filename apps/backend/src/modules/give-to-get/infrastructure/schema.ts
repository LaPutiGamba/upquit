import { boolean, integer, pgTable, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { users } from "../../users/infrastructure/schema";
import { boards } from "../../boards/infrastructure/schema";

export const giveToGetProgress = pgTable(
  "give_to_get_progress",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    boardId: uuid("board_id")
      .notNull()
      .references(() => boards.id),
    votesGiven: integer("votes_given").default(0),
    qualifyingComments: integer("qualifying_comments").default(0),
    canPost: boolean("can_post").default(false),
    unlockedAt: timestamp("unlocked_at", { withTimezone: true })
  },
  (table) => {
    return {
      unq: unique().on(table.userId, table.boardId)
    };
  }
);
