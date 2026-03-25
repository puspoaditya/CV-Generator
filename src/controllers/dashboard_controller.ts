import { db } from "../db";
import { generationHistory, resumes } from "../db/schema";
import { eq, desc, count, sql } from "drizzle-orm";
import type { Context } from "elysia";

const getUserFromToken = async (jwt: any, request: Request) => {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  return await jwt.verify(token);
};

export const getHistory = async ({ jwt, set, request }: Context & { jwt: any }) => {
  const payload = await getUserFromToken(jwt, request);
  if (!payload) {
    set.status = 401;
    return { error: "Unauthorized" };
  }

  const history = await db.query.generationHistory.findMany({
    where: eq(generationHistory.userId, payload.id),
    orderBy: [desc(generationHistory.createdAt)],
  });

  return history;
};

export const getStats = async ({ jwt, set, request }: Context & { jwt: any }) => {
  const payload = await getUserFromToken(jwt, request);
  if (!payload) {
    set.status = 401;
    return { error: "Unauthorized" };
  }

  const resumeCount = await db
    .select({ value: count() })
    .from(resumes)
    .where(eq(resumes.userId, payload.id));

  const historyCount = await db
    .select({ value: count() })
    .from(generationHistory)
    .where(eq(generationHistory.userId, payload.id));

  return {
    totalResumes: resumeCount[0]?.value || 0,
    totalGenerations: historyCount[0]?.value || 0,
  };
};
