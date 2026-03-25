import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { getHistory, getStats } from "../controllers/dashboard_controller";

export const dashboardRoutes = new Elysia({ prefix: "/dashboard" })
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET || 'supersecret'
    })
  )
  .get("/history", getHistory as any)
  .get("/stats", getStats as any);
