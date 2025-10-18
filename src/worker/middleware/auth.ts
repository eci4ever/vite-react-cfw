import { Context, Next } from "hono";
import { getAuthInstance } from "../auth-instance";

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
    const url = new URL(c.req.url);
    const baseURL = `${url.protocol}//${url.host}`;

    const auth = getAuthInstance(c.env, baseURL);
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
    const url = new URL(c.req.url);
    const baseURL = `${url.protocol}//${url.host}`;

    const auth = getAuthInstance(c.env, baseURL);
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
