# AI CV & Cover Letter Generator 🚀

A high-performance, full-stack application for AI-powered career optimization.

## Technology Stack
- **Backend**: Bun + ElysiaJS + Drizzle ORM (Port 3000)
- **Frontend**: Next.js + TailwindCSS + Framer Motion (Port 3001)
- **Database**: PostgreSQL (Supabase)
- **AI Service**: OpenRouter (Model: Step-3.5-Flash)

## Production Deployment Guide

### 1. Database (Railway / Supabase)
- **Setup**: Create a PostgreSQL instance.
- **Connect**: Set the `DATABASE_URL` environment variable.
- **Push Schema**:
  ```bash
  bun run db:push
  ```

### 2. Backend (Railway)
- **Environment Variables**:
  - `PORT`: 3000
  - `DATABASE_URL`: [Your PostgreSQL URL]
  - `JWT_SECRET`: [Any random string]
  - `OPENROUTER_API_KEY`: [Your OpenRouter API Key]
- **Build Command**: `bun install`
- **Start Command**: `bun run start` (or `bun run src/index.ts`)

### 3. Frontend (Vercel)
- **Working Directory**: `web/`
- **Environment Variables**:
  - `NEXT_PUBLIC_API_URL`: [URL of your Railway backend]
- **Framework Preset**: Next.js
- **Install Command**: `bun install`
- **Build Command**: `bun run build`
- **Start Command**: `bun run start`

## Local Development
1. Start Backend: `bun run dev` (from root)
2. Start Frontend: `cd web && bun dev`

---
*Developed with ❤️ as a Premium AI SaaS.*
