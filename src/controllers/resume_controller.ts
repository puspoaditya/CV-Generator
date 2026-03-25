import { db } from "../db";
import { resumes, users } from "../db/schema";
import { eq, and, count } from "drizzle-orm";
import type { Context } from "elysia";

export const createBaseResume = async ({ body, jwt, set, request }: Context & { body: any; jwt: any }) => {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    set.status = 401;
    return { error: "Unauthorized" };
  }

  const token = authHeader.split(" ")[1];
  const payload = await jwt.verify(token);
  if (!payload) {
    set.status = 401;
    return { error: "Unauthorized" };
  }

  const { title, content } = body;
  if (!title || !content) {
    set.status = 400;
    return { error: "Title and content are required" };
  }

  // Fetch user to check tier
  const user = await db.query.users.findFirst({
    where: eq(users.id, payload.id),
  });

  if (!user) {
    set.status = 404;
    return { error: "User not found" };
  }

  // Check tier limit for Free users
  if (user.tier === "free") {
    const existingResumes = await db
      .select({ value: count() })
      .from(resumes)
      .where(and(eq(resumes.userId, user.id), eq(resumes.isBase, 1)));

    if (existingResumes[0].value >= 1) {
      set.status = 403;
      return { error: "Free tier limit reached: Only 1 Base CV allowed" };
    }
  }

  // Save Resume
  await db.insert(resumes).values({
    userId: user.id,
    title,
    content,
    isBase: 1,
  });

  return { message: "Base CV saved successfully" };
};

export const getMyResumes = async ({ jwt, set, request }: Context & { jwt: any }) => {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    set.status = 401;
    return { error: "Unauthorized" };
  }

  const token = authHeader.split(" ")[1];
  const payload = await jwt.verify(token);
  if (!payload) {
    set.status = 401;
    return { error: "Unauthorized" };
  }

  const userResumes = await db.query.resumes.findMany({
    where: eq(resumes.userId, payload.id),
    orderBy: (resumes, { desc }) => [desc(resumes.createdAt)],
  });

  return userResumes;
};
