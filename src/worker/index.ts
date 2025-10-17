import { Hono } from "hono";
import usersRoute from "./routes/users";
import authRoute from "./routes/auth";

type Bindings = {
  d1_vite_react: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/api/", (c) => c.json({ name: "Cloudflare" }));

// Mount the auth routes
app.route("/", authRoute);

// Mount the users routes
app.route("/api/users", usersRoute);

export default app;
