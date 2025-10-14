import { Hono } from "hono";

type Bindings = {
  d1_vite_react: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/api/", (c) => c.json({ name: "Cloudflare" }));

app.get("/api/customers", async (c) => {
  try {
    let { results } = await c.env.d1_vite_react
      .prepare("SELECT * FROM Customers")
      .all();
    return c.json(results);
  } catch (e) {
    return c.json({ err: e as string }, 500);
  }
});

export default app;
