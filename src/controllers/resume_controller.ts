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

import { extractText } from "unpdf";

export const extractPdf = async ({ body, set }: Context & { body: any }) => {
  const { file } = body;
  console.log("Extraction requested for file:", file?.name, file?.type);

  if (!file) {
    set.status = 400;
    return { error: "File is required" };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    const result = await extractText(buffer);
    const text = (Array.isArray(result.text) ? result.text.join("\n") : (result.text || ""));
    
    console.log("Extraction successful, text length (chars):", text.length);
    if (text.length > 0) {
      console.log("Text Preview:", text.substring(0, 100).replace(/\n/g, " "));
    }

    return { text };
  } catch (err: any) {
    console.error("PDF Extraction Error:", err);
    set.status = 500;
    return { error: `Server Extraction Error: ${err.message || 'Unknown error'}` };
  }
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

export const deleteResume = async ({ params, jwt, set, request }: Context & { params: any; jwt: any }) => {
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

  const { id } = params;
  
  await db.delete(resumes).where(
    and(eq(resumes.id, parseInt(id)), eq(resumes.userId, payload.id))
  );

  return { message: "Resume deleted successfully" };
};
