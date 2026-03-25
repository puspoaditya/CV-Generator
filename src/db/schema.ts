import { pgTable, serial, varchar, text, timestamp, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  tier: varchar("tier", { length: 50 }).default("free").notNull(), // free, pro
  createdAt: timestamp("created_at").defaultNow(),
});

export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  isBase: integer("is_base").default(0), // 1 if it's a base CV
  createdAt: timestamp("created_at").defaultNow(),
});

export const generationHistory = pgTable("generation_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // cv, cover_letter, interview_prep
  inputData: text("input_data"), // Job description
  outputData: text("output_data"), // Generated content
  createdAt: timestamp("created_at").defaultNow(),
});
