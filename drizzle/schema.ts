import { pgTable, foreignKey, serial, integer, varchar, text, timestamp, unique, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const resumes = pgTable("resumes", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	title: varchar({ length: 255 }).notNull(),
	content: text().notNull(),
	isBase: integer("is_base").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	type: varchar({ length: 20 }).default('master').notNull(),
	parentId: integer("parent_id"),
	targetRole: varchar("target_role", { length: 255 }),
	jobDescription: text("job_description"),
	matchScore: integer("match_score").default(0),
}, (table) => [
	foreignKey({
			columns: [table.parentId],
			foreignColumns: [table.id],
			name: "resumes_parent_id_resumes_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "resumes_user_id_users_id_fk"
		}),
]);

export const generationHistory = pgTable("generation_history", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	type: varchar({ length: 50 }).notNull(),
	inputData: text("input_data"),
	outputData: text("output_data"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "generation_history_user_id_users_id_fk"
		}),
]);

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	password: varchar({ length: 255 }).notNull(),
	tier: varchar({ length: 50 }).default('free').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	credits: integer().default(3).notNull(),
	stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
	isPro: boolean("is_pro").default(false).notNull(),
	paddleCustomerId: varchar("paddle_customer_id", { length: 255 }),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const transactions = pgTable("transactions", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	amount: integer().notNull(),
	currency: varchar({ length: 10 }).notNull(),
	provider: varchar({ length: 50 }).notNull(),
	status: varchar({ length: 50 }).default('pending'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	orderId: varchar("order_id", { length: 255 }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "transactions_user_id_users_id_fk"
		}),
]);
