import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import type { Context } from "elysia";

export const register = async ({ body, jwt, set }: Context & { body: any; jwt: any }) => {
  const { name, email, password } = body;

  if (!name || !email || !password) {
    set.status = 400;
    return { error: "Missing required fields" };
  }

  // Check if user exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    set.status = 409;
    return { error: "Email already registered" };
  }

  // Hash password
  const hashedPassword = await Bun.password.hash(password);

  // Insert user
  const [newUser] = await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
    tier: "free",
  }).returning();

  // Generate token
  const token = await (jwt as any).sign({
    id: newUser.id,
    email: newUser.email,
  });

  return { 
    message: "User registered successfully", 
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      tier: newUser.tier,
      credits: newUser.credits,
      isPro: newUser.isPro,
    }
  };
};

export const login = async ({ body, jwt, set }: Context & { body: any; jwt: any }) => {
  const { email, password } = body;

  if (!email || !password) {
    set.status = 400;
    return { error: "Email and password are required" };
  }

  // Find user
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    set.status = 401;
    return { error: "Invalid credentials" };
  }

  // Verify password
  const isMatch = await Bun.password.verify(password, user.password);

  if (!isMatch) {
    set.status = 401;
    return { error: "Invalid credentials" };
  }

  // Generate token
  const token = await jwt.sign({
    id: user.id,
    email: user.email,
  });

  return {
    message: "Login successful",
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      tier: user.tier,
      credits: user.credits,
      isPro: user.isPro,
    },
  };
};

export const getMe = async ({ jwt, set, request }: Context & { jwt: any }) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        set.status = 401;
        return { error: "Unauthorized" };
    }

    const token = authHeader.split(" ")[1];
    const payload = await jwt.verify(token);

    if (!payload) {
        set.status = 401;
        return { error: "Unauthorized" };
    }

    const user = await db.query.users.findFirst({
        where: eq(users.id, payload.id),
    });

    if (!user) {
        set.status = 404;
        return { error: "User not found" };
    }

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        tier: user.tier,
        credits: user.credits,
        isPro: user.isPro,
    };
};
