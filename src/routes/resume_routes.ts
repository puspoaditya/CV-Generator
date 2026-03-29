import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { createMasterResume, getMyResumes, extractPdf, deleteResume, parseResumeData } from "../controllers/resume_controller";

export const resumeRoutes = new Elysia({ prefix: "/resumes" })
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET || 'supersecret'
    })
  )
  .post("/", createMasterResume as any, {
    body: t.Object({
      title: t.String(),
      content: t.String(), // Raw text or JSON string
      source: t.Optional(t.String()), // 'manual', 'linkedin', 'pdf'
    }),
  })
  .post("/extract", extractPdf as any, {
    body: t.Object({
      file: t.File(),
    }),
  })
  .post("/parse", parseResumeData as any, {
    body: t.Object({
      content: t.String(),
    }),
  })
  .get("/", getMyResumes as any)
  .delete("/:id", deleteResume as any);
