import { Hono } from "hono";
import { createDb } from "../../db/db";
import { customers } from "../../db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

type Bindings = {
  d1_vite_react: D1Database;
};

const customersRoute = new Hono<{ Bindings: Bindings }>();

// Apply authentication middleware to all routes
customersRoute.use("*", requireAuth);

// GET all customers
customersRoute.get("/", async (c) => {
  try {
    const db = createDb(c.env.d1_vite_react);
    const results = await db.select().from(customers);
    return c.json(results);
  } catch (e) {
    return c.json({ error: (e as Error).message }, 500);
  }
});

// GET customer by ID
customersRoute.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    if (!id) {
      return c.json({ error: "Invalid customer ID" }, 400);
    }

    const db = createDb(c.env.d1_vite_react);
    const result = await db
      .select()
      .from(customers)
      .where(eq(customers.id, id))
      .limit(1);

    if (result.length === 0) {
      return c.json({ error: "Customer not found" }, 404);
    }

    return c.json(result[0]);
  } catch (e) {
    return c.json({ error: (e as Error).message }, 500);
  }
});

// POST create new customer
customersRoute.post("/", async (c) => {
  try {
    const body = await c.req.json();

    if (!body.name || !body.email) {
      return c.json({ error: "name and email are required" }, 400);
    }

    // Validate email format (basic validation)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return c.json({ error: "invalid email format" }, 400);
    }

    const db = createDb(c.env.d1_vite_react);

    // Generate a unique ID
    const id = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const now = new Date();
    const result = await db
      .insert(customers)
      .values({
        id,
        name: body.name,
        email: body.email,
        image_url: body.image_url || null,
        createdAt: now,
        updatedAt: now,
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

// PUT update customer
customersRoute.put("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    if (!id) {
      return c.json({ error: "Invalid customer ID" }, 400);
    }

    const body = await c.req.json();
    const db = createDb(c.env.d1_vite_react);

    // Check if customer exists
    const existing = await db
      .select()
      .from(customers)
      .where(eq(customers.id, id))
      .limit(1);

    if (existing.length === 0) {
      return c.json({ error: "Customer not found" }, 404);
    }

    // Validate email format if provided
    if (body.email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return c.json({ error: "invalid email format" }, 400);
      }
    }

    const result = await db
      .update(customers)
      .set({
        name: body.name !== undefined ? body.name : existing[0].name,
        email: body.email !== undefined ? body.email : existing[0].email,
        image_url:
          body.image_url !== undefined ? body.image_url : existing[0].image_url,
        updatedAt: new Date(),
      })
      .where(eq(customers.id, id))
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

// DELETE customer
customersRoute.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    if (!id) {
      return c.json({ error: "Invalid customer ID" }, 400);
    }

    const db = createDb(c.env.d1_vite_react);

    // Check if customer exists
    const existing = await db
      .select()
      .from(customers)
      .where(eq(customers.id, id))
      .limit(1);

    if (existing.length === 0) {
      return c.json({ error: "Customer not found" }, 404);
    }

    await db.delete(customers).where(eq(customers.id, id));

    return c.json({ message: "Customer deleted successfully" });
  } catch (e) {
    return c.json({ error: (e as Error).message }, 500);
  }
});

export default customersRoute;
