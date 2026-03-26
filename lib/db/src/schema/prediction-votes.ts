import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { predictionsTable } from "./predictions";

export const predictionVotesTable = pgTable("prediction_votes", {
  id: serial("id").primaryKey(),
  predictionId: integer("prediction_id").notNull().references(() => predictionsTable.id),
  choice: text("choice").notNull(),
  voterToken: text("voter_token").notNull(),
  country: text("country"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type PredictionVote = typeof predictionVotesTable.$inferSelect;
