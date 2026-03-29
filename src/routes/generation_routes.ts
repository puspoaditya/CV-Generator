import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { handleGenerateResume, handleGenerateCoverLetter, handleGenerateInterviewPrep, handleGuestGenerate, handleLinkedInExtract, handleGeneratePDF } from "../controllers/generation_controller";

export const generationRoutes = new Elysia({ prefix: "/generate" })
  .post("/guest", handleGuestGenerate as any, {
    body: t.Object({
      resumeContent: t.String(),
      jobDescription: t.String(),
    }),
  })
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET || 'supersecret'
    })
  )
  .post("/resume", handleGenerateResume as any, {
    body: t.Object({
      baseResumeId: t.Number(),
      jobDescription: t.String(),
    }),
  })
  .post("/cover-letter", handleGenerateCoverLetter as any, {
    body: t.Object({
      baseResumeId: t.Number(),
      jobDescription: t.String(),
    }),
  })
  .post("/interview-prep", handleGenerateInterviewPrep as any, {
    body: t.Object({
      baseResumeId: t.Number(),
      jobDescription: t.String(),
    }),
  })
  .post("/extract-linkedin", handleLinkedInExtract as any, {
    body: t.Object({
      url: t.String(),
    }),
  })
  .post("/export-pdf", handleGeneratePDF as any, {
    body: t.Object({
      content: t.String(),
    }),
  });
