import { mysqlTable, serial, varchar, text, timestamp, int, json } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  tier: varchar("tier", { length: 50 }).default("free").notNull(), // free, pro
  createdAt: timestamp("created_at").defaultNow(),
});

export const resumes = mysqlTable("resumes", {
  id: serial("id").primaryKey(),
  userId: int("user_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(), // Unified JSON or Plain text
  isBase: int("is_base").default(0), // 1 if it's a base CV
  createdAt: timestamp("created_at").defaultNow(),
});

export const generationHistory = mysqlTable("generation_history", {
  id: serial("id").primaryKey(),
  userId: int("user_id").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // cv, cover_letter, interview_prep
  inputData: text("input_data"), // Job description
  outputData: text("output_data"), // Generated content
  createdAt: timestamp("created_at").defaultNow(),
});
