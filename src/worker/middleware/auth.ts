import { Context, Next } from "hono";
import { betterAuth } from "better-auth";
import { admin as adminPlugin } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createDb } from "../../db/db";

type Bindings = {
  d1_vite_react: D1Database;
  BETTER_AUTH_SECRET: string;
};

type Variables = {
  user?: any;
  session?: any;
};

export async function requireAuth(
  c: Context<{ Bindings: Bindings; Variables: Variables }>,
  next: Next
) {
  try {
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
      secret:
        c.env.BETTER_AUTH_SECRET || "your-secret-key-change-in-production",
      plugins: [adminPlugin()],
    });

    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Add user to context
    c.set("user", session.user);
    c.set("session", session);

    await next();
  } catch (error) {
    return c.json({ error: "Authentication failed" }, 401);
  }
}

export async function optionalAuth(
  c: Context<{ Bindings: Bindings; Variables: Variables }>,
  next: Next
) {
  try {
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
      secret:
        c.env.BETTER_AUTH_SECRET || "your-secret-key-change-in-production",
    });

    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (session) {
      c.set("user", session.user);
      c.set("session", session);
    }

    await next();
  } catch (error) {
    // Continue without authentication
    await next();
  }
}
