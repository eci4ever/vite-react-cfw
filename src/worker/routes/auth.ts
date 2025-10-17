import { Hono } from "hono";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createDb } from "../../db/db";

type Bindings = {
  d1_vite_react: D1Database;
  BETTER_AUTH_SECRET: string;
};

const authRoute = new Hono<{ Bindings: Bindings }>();

// Create auth instance with database from context
authRoute.all("/api/auth/*", async (c) => {
  const db = createDb(c.env.d1_vite_react);

  // Get the request URL to determine the base URL dynamically
  const url = new URL(c.req.url);
  const baseURL = `${url.protocol}//${url.host}`;

  const auth = betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
    }),
    emailAndPassword: {
      enabled: true,
    },
    trustedOrigins: [baseURL],
    baseURL: baseURL,
    secret: c.env.BETTER_AUTH_SECRET || "your-secret-key-change-in-production",
  });

  return auth.handler(c.req.raw);
});

export default authRoute;
