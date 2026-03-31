import { pgTable, serial, integer, varchar, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  tier: varchar("tier", { length: 50 }).default("free").notNull(),
  credits: integer("credits").default(3).notNull(),
  is_pro: boolean("is_pro").default(false).notNull(),
  stripe_customer_id: varchar("stripe_customer_id", { length: 255 }),
  paddle_customer_id: varchar("paddle_customer_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  type: varchar("type", { length: 50 }).default("master").notNull(), // 'master' or 'optimized'
  source: varchar("source", { length: 50 }).default("manual"), // 'manual', 'linkedin', 'pdf'
  targetRole: varchar("target_role", { length: 255 }),
  targetCompany: varchar("target_company", { length: 255 }),
  masterId: integer("master_id"), // Reference if it's an optimized CV
  isBase: integer("is_base").default(1),
  parentId: integer("parent_id"),
  jobDescription: text("job_description"),
  matchScore: integer("match_score").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const generationHistory = pgTable("generation_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(),
  inputData: text("input_data"),
  outputData: text("output_data"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(),
  currency: varchar("currency", { length: 10 }).notNull(),
  provider: varchar("provider", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).default("pending"),
  orderId: varchar("order_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
