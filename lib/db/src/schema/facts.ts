import { pgTable, text, serial, timestamp, boolean, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const factsTable = pgTable("facts", {
  id: serial("id").primaryKey(),
  claim: text("claim").notNull(),
  verdict: text("verdict").notNull(),
  explanation: text("explanation").notNull(),
  source: text("source"),
  category: text("category").notNull(),
  language: text("language").notNull().default("en"),
  keywords: text("keywords").array().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertFactSchema = createInsertSchema(factsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertFact = z.infer<typeof insertFactSchema>;
export type Fact = typeof factsTable.$inferSelect;
