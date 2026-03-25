import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { swagger } from "@elysiajs/swagger";
import { authRoutes } from "./routes/auth_routes";

const app = new Elysia()
  .use(swagger())
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET || 'supersecret'
    })
  )
  .get("/", () => "Welcome to CV & Cover Letter Generator API")
  .get("/ping", () => ({ status: "ok", uptime: process.uptime() }))
  .group("/api", (app) => 
    app
      .use(authRoutes)
      .get("/hello", () => "Hello from API")
  )
  .listen(process.env.PORT || 3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;
