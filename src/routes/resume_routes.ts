import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { createBaseResume, getMyResumes } from "../controllers/resume_controller";

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
  .get("/", getMyResumes as any);
