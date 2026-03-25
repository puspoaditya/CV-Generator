import { db } from "../db";
import { resumes, generationHistory, users } from "../db/schema";
import { eq, and, count } from "drizzle-orm";
import { generateOptimizedResume, generateCoverLetter, generateInterviewQuestions } from "../services/ai_service";
import type { Context } from "elysia";

const getUserFromToken = async (jwt: any, request: Request) => {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  return await jwt.verify(token);
};

export const handleGenerateResume = async ({ body, jwt, set, request }: Context & { body: any; jwt: any }) => {
  const payload = await getUserFromToken(jwt, request);
  if (!payload) {
    set.status = 401;
    return { error: "Unauthorized" };
  }

  const { baseResumeId, jobDescription } = body;
  if (!baseResumeId || !jobDescription) {
    set.status = 400;
    return { error: "Base Resume ID and Job Description are required" };
  }

  // Fetch Base Resume and verify ownership
  const baseResume = await db.query.resumes.findFirst({
    where: and(eq(resumes.id, baseResumeId), eq(resumes.userId, payload.id)),
  });

  if (!baseResume) {
    set.status = 404;
    return { error: "Base Resume not found" };
  }

  // AI Generation
  const optimizedContent = await generateOptimizedResume(baseResume.content, jobDescription);

  if (!optimizedContent) {
    set.status = 500;
    return { error: "AI Generation failed" };
  }

  // Save to History & New Resume
  await db.insert(resumes).values({
    userId: payload.id,
    title: `Optimized: ${baseResume.title}`,
    content: optimizedContent,
    isBase: 0,
  });

  await db.insert(generationHistory).values({
    userId: payload.id,
    type: "cv",
    inputData: jobDescription,
    outputData: optimizedContent,
  });

  return {
    message: "Resume optimized successfully",
  };
};

export const handleGenerateCoverLetter = async ({ body, jwt, set, request }: Context & { body: any; jwt: any }) => {
  const payload = await getUserFromToken(jwt, request);
  if (!payload) {
    set.status = 401;
    return { error: "Unauthorized" };
  }

  const { baseResumeId, jobDescription } = body;
  if (!baseResumeId || !jobDescription) {
    set.status = 400;
    return { error: "Base Resume ID and Job Description are required" };
  }

  const baseResume = await db.query.resumes.findFirst({
    where: and(eq(resumes.id, baseResumeId), eq(resumes.userId, payload.id)),
  });

  if (!baseResume) {
    set.status = 404;
    return { error: "Base Resume not found" };
  }

  const coverLetter = await generateCoverLetter(baseResume.content, jobDescription);

  if (!coverLetter) {
    set.status = 500;
    return { error: "AI Generation failed" };
  }

  await db.insert(generationHistory).values({
    userId: payload.id,
    type: "cover_letter",
    inputData: jobDescription,
    outputData: coverLetter,
  });

  return {
    message: "Cover Letter generated successfully",
    content: coverLetter,
  };
};

export const handleGenerateInterviewPrep = async ({ body, jwt, set, request }: Context & { body: any; jwt: any }) => {
  const payload = await getUserFromToken(jwt, request);
  if (!payload) {
    set.status = 401;
    return { error: "Unauthorized" };
  }

  const { baseResumeId, jobDescription } = body;
  if (!baseResumeId || !jobDescription) {
    set.status = 400;
    return { error: "Base Resume ID and Job Description are required" };
  }

  const baseResume = await db.query.resumes.findFirst({
    where: and(eq(resumes.id, baseResumeId), eq(resumes.userId, payload.id)),
  });

  if (!baseResume) {
    set.status = 404;
    return { error: "Base Resume not found" };
  }

  const interviewPrep = await generateInterviewQuestions(baseResume.content, jobDescription);

  if (!interviewPrep) {
    set.status = 500;
    return { error: "AI Generation failed" };
  }

  await db.insert(generationHistory).values({
    userId: payload.id,
    type: "interview_prep",
    inputData: jobDescription,
    outputData: interviewPrep,
  });

  return {
    message: "Interview preparation generated successfully",
    content: interviewPrep,
  };
};
