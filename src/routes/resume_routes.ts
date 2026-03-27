import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { createBaseResume, getMyResumes, extractPdf, deleteResume } from "../controllers/resume_controller";

export const resumeRoutes = new Elysia({ prefix: "/resumes" })
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET || 'supersecret'
    })
  )
  .post("/", createBaseResume as any, {
    body: t.Object({
      title: t.String(),
      content: t.String(), // Raw text or JSON string
    }),
  })
  .post("/extract", extractPdf as any, {
    body: t.Object({
      file: t.File(),
    }),
  })
  .get("/", getMyResumes as any)
  .delete("/:id", deleteResume as any);
