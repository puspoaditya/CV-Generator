import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { register, login, getMe, googleAuth } from "../controllers/auth_controller";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET || 'supersecret'
    })
  )
  .post("/register", register as any, {
    body: t.Object({
      name: t.String(),
      email: t.String(),
      password: t.String(),
    }),
  })
  .post("/login", login as any, {
    body: t.Object({
      email: t.String(),
      password: t.String(),
    }),
  })
  .post("/google-login", googleAuth as any, {
    body: t.Object({
      email: t.String(),
      name: t.String(),
      image: t.Optional(t.String()),
    }),
  })
  .get("/me", getMe as any);
