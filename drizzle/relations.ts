import { relations } from "drizzle-orm/relations";
import { resumes, users, generationHistory, transactions } from "./schema";

export const resumesRelations = relations(resumes, ({one, many}) => ({
	resume: one(resumes, {
		fields: [resumes.parentId],
		references: [resumes.id],
		relationName: "resumes_parentId_resumes_id"
	}),
	resumes: many(resumes, {
		relationName: "resumes_parentId_resumes_id"
	}),
	user: one(users, {
		fields: [resumes.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	resumes: many(resumes),
	generationHistories: many(generationHistory),
	transactions: many(transactions),
}));

export const generationHistoryRelations = relations(generationHistory, ({one}) => ({
	user: one(users, {
		fields: [generationHistory.userId],
		references: [users.id]
	}),
}));

export const transactionsRelations = relations(transactions, ({one}) => ({
	user: one(users, {
		fields: [transactions.userId],
		references: [users.id]
	}),
}));