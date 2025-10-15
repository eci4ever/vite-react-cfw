import { Hono } from "hono";
import { createDb } from "../../db/db";
import { usersTable } from "../../db/schema";
import { eq } from "drizzle-orm";

type Bindings = {
  d1_vite_react: D1Database;
};

const usersRoute = new Hono<{ Bindings: Bindings }>();

// GET all users
usersRoute.get("/", async (c) => {
  try {
    const db = createDb(c.env.d1_vite_react);
    const results = await db.select().from(usersTable);
    return c.json(results);
  } catch (e) {
    return c.json({ error: (e as Error).message }, 500);
  }
});

// GET user by ID
usersRoute.get("/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) {
      return c.json({ error: "Invalid user ID" }, 400);
    }

    const db = createDb(c.env.d1_vite_react);
    const result = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);

    if (result.length === 0) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json(result[0]);
  } catch (e) {
    return c.json({ error: (e as Error).message }, 500);
  }
});

// POST create new user
usersRoute.post("/", async (c) => {
  try {
    const body = await c.req.json();

    if (!body.name || !body.age || !body.email) {
      return c.json({ error: "name, age, and email are required" }, 400);
    }

    // Validate age is a number
    if (typeof body.age !== "number" || body.age < 0) {
      return c.json({ error: "age must be a positive number" }, 400);
    }

    // Validate email format (basic validation)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return c.json({ error: "invalid email format" }, 400);
    }

    const db = createDb(c.env.d1_vite_react);
    const result = await db
      .insert(usersTable)
      .values({
        name: body.name,
        age: body.age,
        email: body.email,
      })
      .returning();

    return c.json(result[0], 201);
  } catch (e) {
    const error = e as Error;
    if (error.message.includes("UNIQUE constraint failed")) {
      return c.json({ error: "Email already exists" }, 409);
    }
    return c.json({ error: error.message }, 500);
  }
});

// PUT update user
usersRoute.put("/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) {
      return c.json({ error: "Invalid user ID" }, 400);
    }

    const body = await c.req.json();
    const db = createDb(c.env.d1_vite_react);

    // Check if user exists
    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);

    if (existing.length === 0) {
      return c.json({ error: "User not found" }, 404);
    }

    // Validate age if provided
    if (body.age !== undefined) {
      if (typeof body.age !== "number" || body.age < 0) {
        return c.json({ error: "age must be a positive number" }, 400);
      }
    }

    // Validate email format if provided
    if (body.email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return c.json({ error: "invalid email format" }, 400);
      }
    }

    const result = await db
      .update(usersTable)
      .set({
        name: body.name !== undefined ? body.name : existing[0].name,
        age: body.age !== undefined ? body.age : existing[0].age,
        email: body.email !== undefined ? body.email : existing[0].email,
      })
      .where(eq(usersTable.id, id))
      .returning();

    return c.json(result[0]);
  } catch (e) {
    const error = e as Error;
    if (error.message.includes("UNIQUE constraint failed")) {
      return c.json({ error: "Email already exists" }, 409);
    }
    return c.json({ error: error.message }, 500);
  }
});

// DELETE user
usersRoute.delete("/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) {
      return c.json({ error: "Invalid user ID" }, 400);
    }

    const db = createDb(c.env.d1_vite_react);

    // Check if user exists
    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);

    if (existing.length === 0) {
      return c.json({ error: "User not found" }, 404);
    }

    await db.delete(usersTable).where(eq(usersTable.id, id));

    return c.json({ message: "User deleted successfully" });
  } catch (e) {
    return c.json({ error: (e as Error).message }, 500);
  }
});

export default usersRoute;
