import { pgTable, serial, varchar, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  tier: varchar("tier", { length: 50 }).default("free").notNull(), // free, pro
  credits: integer("credits").default(3).notNull(), // Initial free credits
  isPro: boolean("is_pro").default(false).notNull(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  isBase: integer("is_base").default(0), // 1 if it's a base CV
  createdAt: timestamp("created_at").defaultNow(),
});

export const generationHistory = pgTable("generation_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(), // cv, cover_letter, interview_prep
  inputData: text("input_data"), // Job description
  outputData: text("output_data"), // Generated content
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(),
  currency: varchar("currency", { length: 10 }).notNull(), // 'USD' or 'IDR'
  provider: varchar("provider", { length: 50 }).notNull(), // 'stripe' or 'midtrans'
  status: varchar("status", { length: 50 }).default("pending"), // 'pending', 'success', 'failed'
  orderId: varchar("order_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
