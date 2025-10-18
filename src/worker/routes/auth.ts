import { Hono } from "hono";
import { getAuthInstance } from "../auth-instance";

type Bindings = {
  d1_vite_react: D1Database;
  BETTER_AUTH_SECRET: string;
};

const authRoute = new Hono<{ Bindings: Bindings }>();

// Use singleton auth instance for better performance
authRoute.all("/api/auth/*", async (c) => {
  const url = new URL(c.req.url);
  const baseURL = `${url.protocol}//${url.host}`;

  const auth = getAuthInstance(c.env, baseURL);
  return auth.handler(c.req.raw);
});

export default authRoute;
