import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { handleGenerateResume, handleGenerateCoverLetter, handleGenerateInterviewPrep } from "../controllers/generation_controller";

export const generationRoutes = new Elysia({ prefix: "/generate" })
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
  });
