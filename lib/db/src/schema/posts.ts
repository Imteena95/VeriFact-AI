import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { factsTable } from "./facts";

export const postsTable = pgTable("posts", {
  id: serial("id").primaryKey(),
  originalText: text("original_text").notNull(),
  optimizedClaim: text("optimized_claim").notNull(),
  language: text("language").notNull().default("en"),
  verdict: text("verdict").notNull().default("unverified"),
  confidence: real("confidence").notNull().default(0),
  matchedFactId: integer("matched_fact_id").references(() => factsTable.id),
  explanation: text("explanation").notNull().default(""),
  processingTimeMs: integer("processing_time_ms").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPostSchema = createInsertSchema(postsTable).omit({ id: true, createdAt: true });
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof postsTable.$inferSelect;
