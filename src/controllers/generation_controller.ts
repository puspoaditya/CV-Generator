import { db } from "../db";
import { resumes, generationHistory, users } from "../db/schema";
import { eq, and, count } from "drizzle-orm";
import { generateOptimizedResume, generateCoverLetter, generateInterviewQuestions, extractResumeFromLinkedIn, generateStructuredResume } from "../services/ai_service";
import { generatePDF } from "../services/pdf_service";
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

  // Extract job info for a better title if possible
  let customTitle = `Optimized: ${baseResume.title}`;
  try {
    const jobLines = jobDescription.split('\n');
    const pos = jobLines.find((l: string) => l.includes('POSITION:'))?.replace('POSITION:', '').trim();
    const comp = jobLines.find((l: string) => l.includes('COMPANY:'))?.replace('COMPANY:', '').trim();
    if (pos && comp) customTitle = `${pos} @ ${comp}`;
    else if (pos) customTitle = `${pos} Optimized`;
  } catch (e) {}

  // Save to History & New Resume
  await db.insert(resumes).values({
    userId: payload.id,
    title: customTitle,
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

export const handleLinkedInExtract = async ({ body, set }: Context & { body: any }) => {
  const { url } = body;
  if (!url || !url.includes("linkedin.com/in/")) {
    set.status = 400;
    return { error: "URL LinkedIn tidak valid. Gunakan format linkedin.com/in/username" };
  }

  // Try to use regional subdomain as it often bypasses authwalls better
  const targetUrl = url.replace("www.linkedin.com", "id.linkedin.com");

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Referer": "https://www.google.com/",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "cross-site",
        "Upgrade-Insecure-Requests": "1"
      }
    });

    if (!response.ok) {
       // Fallback to original URL if regional fails
       if (targetUrl !== url) {
          const fallbackRes = await fetch(url, { headers: { "Referer": "https://www.google.com/", "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" } });
          if (fallbackRes.ok) {
             const html = await fallbackRes.text();
             const content = await extractResumeFromLinkedIn(html);
             return { success: true, content };
          }
       }
       throw new Error(`LinkedIn memblokir akses (Status: ${response.status}). Profil ini mungkin diatur sebagai privat.`);
    }

    const html = await response.text();
    
    // Check if we hit an authwall even with 200 OK
    if (html.includes("authwall") || html.includes("Sign in to see") || html.includes("guest-join-modal")) {
       throw new Error("LinkedIn mengalihkan ke halaman login. Profil ini tidak dapat diakses secara publik.");
    }

    const extractedContent = await extractResumeFromLinkedIn(html);
    
    return {
      success: true,
      content: extractedContent,
    };
  } catch (err: any) {
    console.error("LinkedIn Extraction Error:", err);
    set.status = 500;
    return { error: `Gagal menarik data: ${err.message}` };
  }
};

export const handleGeneratePDF = async ({ body, set }: Context & { body: any }) => {
  const { content } = body;
  if (!content) {
    set.status = 400;
    return { error: "Content (Markdown) is required" };
  }

  try {
    console.info("PDF Generation Started for content length:", content.length);
    const structuredData = await generateStructuredResume(content);
    if (!structuredData) throw new Error("Gagal mem-parsing data resume.");
    console.info("Structured Data Generated:", structuredData.name);
    
    const pdfBuffer = await generatePDF(structuredData);
    console.info("PDF Buffer Generated, length:", pdfBuffer.length);
    
    set.headers['Content-Type'] = 'application/pdf';
    set.headers['Content-Disposition'] = `attachment; filename="CVCraft_Resume.pdf"`;
    
    return pdfBuffer;
  } catch (err: any) {
    console.error("PDF Handler Error:", err);
    set.status = 500;
    return { error: `Ekspor PDF Gagal: ${err.message}` };
  }
};
