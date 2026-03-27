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

  const user = await db.query.users.findFirst({ where: eq(users.id, payload.id) });
  if (!user) {
    set.status = 404;
    return { error: "User not found" };
  }

  if (!user.isPro && user.credits <= 0) {
    set.status = 403;
    return { error: "Insufficient credits. Please upgrade to Pro or buy more credits." };
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

  // AI Generation
  let optimizedContent;
  try {
    optimizedContent = await generateOptimizedResume(baseResume.content, jobDescription);
    if (!optimizedContent) throw new Error("AI returned no content");
  } catch (err: any) {
    set.status = 500;
    return { error: `AI Optimizing Failed: ${err.message}` };
  }

  // Deduct Credits if not Pro
  if (!user.isPro) {
    await db.update(users).set({ credits: user.credits - 1 }).where(eq(users.id, user.id));
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
    content: optimizedContent,
    remainingCredits: user.isPro ? "Unlimited" : user.credits - 1,
  };
};

export const handleGenerateCoverLetter = async ({ body, jwt, set, request }: Context & { body: any; jwt: any }) => {
  const payload = await getUserFromToken(jwt, request);
  if (!payload) {
    set.status = 401;
    return { error: "Unauthorized" };
  }

  const user = await db.query.users.findFirst({ where: eq(users.id, payload.id) });
  if (!user) {
    set.status = 404;
    return { error: "User not found" };
  }

  if (!user.isPro && user.credits <= 0) {
    set.status = 403;
    return { error: "Insufficient credits. Please upgrade to Pro or buy more credits." };
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

  let coverLetter;
  try {
    coverLetter = await generateCoverLetter(baseResume.content, jobDescription);
    if (!coverLetter) throw new Error("AI returned no content");
  } catch (err: any) {
    set.status = 500;
    return { error: `AI Cover Letter Failed: ${err.message}` };
  }

  // Deduct Credits if not Pro
  if (!user.isPro) {
    await db.update(users).set({ credits: user.credits - 1 }).where(eq(users.id, user.id));
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
    remainingCredits: user.isPro ? "Unlimited" : user.credits - 1,
  };
};

export const handleGenerateInterviewPrep = async ({ body, jwt, set, request }: Context & { body: any; jwt: any }) => {
  const payload = await getUserFromToken(jwt, request);
  if (!payload) {
    set.status = 401;
    return { error: "Unauthorized" };
  }

  const user = await db.query.users.findFirst({ where: eq(users.id, payload.id) });
  if (!user) {
    set.status = 404;
    return { error: "User not found" };
  }

  if (!user.isPro && user.credits <= 0) {
    set.status = 403;
    return { error: "Insufficient credits. Please upgrade to Pro or buy more credits." };
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

  let interviewPrep;
  try {
    interviewPrep = await generateInterviewQuestions(baseResume.content, jobDescription);
    if (!interviewPrep) throw new Error("AI returned no content");
  } catch (err: any) {
    set.status = 500;
    return { error: `AI Interview Prep Failed: ${err.message}` };
  }

  // Deduct Credits if not Pro
  if (!user.isPro) {
    await db.update(users).set({ credits: user.credits - 1 }).where(eq(users.id, user.id));
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
    remainingCredits: user.isPro ? "Unlimited" : user.credits - 1,
  };
};

export const handleGuestGenerate = async ({ body, set }: Context & { body: any }) => {
  const { resumeContent, jobDescription } = body;
  
  if (!resumeContent || !jobDescription) {
    set.status = 400;
    return { error: "Resume Content and Job Description are required" };
  }

  try {
    const optimizedContent = await generateOptimizedResume(resumeContent, jobDescription);
    if (!optimizedContent) throw new Error("AI returned no content");
    
    return {
      message: "Guest optimization successful",
      content: optimizedContent,
    };
  } catch (err: any) {
    set.status = 500;
    return { error: `AI Guest Optimizing Failed: ${err.message}` };
  }
};
