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

  if (!user.is_pro && user.credits <= 0) {
    set.status = 403;
    return { error: "Insufficient credits. Please upgrade to Pro or buy more credits." };
  }

  const { masterResumeId, targetRole, targetCompany, jobDescription } = body;
  if (!masterResumeId || !jobDescription) {
    set.status = 400;
    return { error: "Master Resume ID and Job Description are required" };
  }

  const masterResume = await db.query.resumes.findFirst({
    where: and(eq(resumes.id, masterResumeId), eq(resumes.userId, payload.id)),
  });

  if (!masterResume) {
    set.status = 404;
    return { error: "Master Resume not found" };
  }

  // AI Generation
  let optimizedContent;
  try {
    const aiPrompt = `Optimize this resume for a ${targetRole || 'specific role'} at ${targetCompany || 'this company'}.
    
    JOB DESCRIPTION:
    ${jobDescription}
    
    RESUME DATA:
    ${masterResume.content}`;

    optimizedContent = await generateOptimizedResume(masterResume.content, aiPrompt);
    if (!optimizedContent) throw new Error("AI returned no content");
  } catch (err: any) {
    set.status = 500;
    return { error: `AI Optimizing Failed: ${err.message}` };
  }

  // Deduct Credits if not Pro
  if (!user.is_pro) {
    await db.update(users).set({ credits: user.credits - 1 }).where(eq(users.id, user.id));
  }

  // Dynamic naming: Target Role - Target Company
  let customTitle = "CV Optimized";
  if (targetRole && targetCompany) {
    customTitle = `${targetRole} - ${targetCompany}`;
  } else if (targetRole) {
    customTitle = `${targetRole} Optimized`;
  }

  // Save to New Resume as Optimized
  await db.insert(resumes).values({
    userId: payload.id,
    title: customTitle,
    content: optimizedContent,
    type: "optimized",
    masterId: masterResume.id,
    targetRole: targetRole || null,
    targetCompany: targetCompany || null,
  });

  await db.insert(generationHistory).values({
    userId: payload.id,
    type: "cv",
    inputData: `Role: ${targetRole}, Company: ${targetCompany}\n\n${jobDescription}`,
    outputData: optimizedContent,
  });

  return {
    message: "Resume optimized successfully",
    content: optimizedContent,
    remainingCredits: user.is_pro ? "Unlimited" : user.credits - 1,
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

  if (!user.is_pro && user.credits <= 0) {
    set.status = 403;
    return { error: "Insufficient credits. Please upgrade to Pro or buy more credits." };
  }

  const { masterResumeId, jobDescription } = body;
  if (!masterResumeId || !jobDescription) {
    set.status = 400;
    return { error: "Master Resume ID and Job Description are required" };
  }

  const masterResume = await db.query.resumes.findFirst({
    where: and(eq(resumes.id, masterResumeId), eq(resumes.userId, payload.id)),
  });

  if (!masterResume) {
    set.status = 404;
    return { error: "Master Resume not found" };
  }

  let coverLetter;
  try {
    coverLetter = await generateCoverLetter(masterResume.content, jobDescription);
    if (!coverLetter) throw new Error("AI returned no content");
  } catch (err: any) {
    set.status = 500;
    return { error: `AI Cover Letter Failed: ${err.message}` };
  }

  // Deduct Credits if not Pro
  if (!user.is_pro) {
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
    remainingCredits: user.is_pro ? "Unlimited" : user.credits - 1,
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

  if (!user.is_pro && user.credits <= 0) {
    set.status = 403;
    return { error: "Insufficient credits. Please upgrade to Pro or buy more credits." };
  }

  const { masterResumeId, jobDescription } = body;
  if (!masterResumeId || !jobDescription) {
    set.status = 400;
    return { error: "Master Resume ID and Job Description are required" };
  }

  const masterResume = await db.query.resumes.findFirst({
    where: and(eq(resumes.id, masterResumeId), eq(resumes.userId, payload.id)),
  });

  if (!masterResume) {
    set.status = 404;
    return { error: "Master Resume not found" };
  }

  let interviewPrep;
  try {
    interviewPrep = await generateInterviewQuestions(masterResume.content, jobDescription);
    if (!interviewPrep) throw new Error("AI returned no content");
  } catch (err: any) {
    set.status = 500;
    return { error: `AI Interview Prep Failed: ${err.message}` };
  }

  // Deduct Credits if not Pro
  if (!user.is_pro) {
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
    remainingCredits: user.is_pro ? "Unlimited" : user.credits - 1,
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
