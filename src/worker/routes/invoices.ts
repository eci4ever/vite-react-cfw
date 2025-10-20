import { Hono } from "hono";
import { createDb } from "../../db/db";
import { invoices, customers } from "../../db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

type Bindings = {
  d1_vite_react: D1Database;
};

const invoicesRoute = new Hono<{ Bindings: Bindings }>();

// Apply authentication middleware to all routes
invoicesRoute.use("*", requireAuth);

// GET all invoices with customer information
invoicesRoute.get("/", async (c) => {
  try {
    const db = createDb(c.env.d1_vite_react);
    const results = await db
      .select({
        id: invoices.id,
        customer_id: invoices.customer_id,
        customer_name: customers.name,
        customer_email: customers.email,
        amount: invoices.amount,
        date: invoices.date,
        status: invoices.status,
        createdAt: invoices.createdAt,
        updatedAt: invoices.updatedAt,
      })
      .from(invoices)
      .leftJoin(customers, eq(invoices.customer_id, customers.id));
    return c.json(results);
  } catch (e) {
    return c.json({ error: (e as Error).message }, 500);
  }
});

// GET invoice by ID
invoicesRoute.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    if (!id) {
      return c.json({ error: "Invalid invoice ID" }, 400);
    }

    const db = createDb(c.env.d1_vite_react);
    const result = await db
      .select({
        id: invoices.id,
        customer_id: invoices.customer_id,
        customer_name: customers.name,
        customer_email: customers.email,
        amount: invoices.amount,
        date: invoices.date,
        status: invoices.status,
        createdAt: invoices.createdAt,
        updatedAt: invoices.updatedAt,
      })
      .from(invoices)
      .leftJoin(customers, eq(invoices.customer_id, customers.id))
      .where(eq(invoices.id, id))
      .limit(1);

    if (result.length === 0) {
      return c.json({ error: "Invoice not found" }, 404);
    }

    return c.json(result[0]);
  } catch (e) {
    return c.json({ error: (e as Error).message }, 500);
  }
});

// POST create new invoice
invoicesRoute.post("/", async (c) => {
  try {
    const body = await c.req.json();

    if (!body.customer_id || !body.amount || !body.date) {
      return c.json(
        { error: "customer_id, amount, and date are required" },
        400
      );
    }

    // Validate amount is a positive number
    if (typeof body.amount !== "number" || body.amount <= 0) {
      return c.json({ error: "amount must be a positive number" }, 400);
    }

    // Validate status
    if (body.status && !["pending", "paid"].includes(body.status)) {
      return c.json(
        { error: "status must be either 'pending' or 'paid'" },
        400
      );
    }

    const db = createDb(c.env.d1_vite_react);

    // Check if customer exists
    const customerExists = await db
      .select()
      .from(customers)
      .where(eq(customers.id, body.customer_id))
      .limit(1);

    if (customerExists.length === 0) {
      return c.json({ error: "Customer not found" }, 404);
    }

    // Generate a unique ID
    const id = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const now = new Date();
    const result = await db
      .insert(invoices)
      .values({
        id,
        customer_id: body.customer_id,
        amount: body.amount,
        date: new Date(body.date),
        status: body.status || "pending",
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return c.json(result[0], 201);
  } catch (e) {
    return c.json({ error: (e as Error).message }, 500);
  }
});

// PUT update invoice
invoicesRoute.put("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    if (!id) {
      return c.json({ error: "Invalid invoice ID" }, 400);
    }

    const body = await c.req.json();
    const db = createDb(c.env.d1_vite_react);

    // Check if invoice exists
    const existing = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, id))
      .limit(1);

    if (existing.length === 0) {
      return c.json({ error: "Invoice not found" }, 404);
    }

    // Validate amount if provided
    if (body.amount !== undefined) {
      if (typeof body.amount !== "number" || body.amount <= 0) {
        return c.json({ error: "amount must be a positive number" }, 400);
      }
    }

    // Validate status if provided
    if (body.status !== undefined) {
      if (!["pending", "paid"].includes(body.status)) {
        return c.json(
          { error: "status must be either 'pending' or 'paid'" },
          400
        );
      }
    }

    // Validate customer_id if provided
    if (body.customer_id !== undefined) {
      const customerExists = await db
        .select()
        .from(customers)
        .where(eq(customers.id, body.customer_id))
        .limit(1);

      if (customerExists.length === 0) {
        return c.json({ error: "Customer not found" }, 404);
      }
    }

    const result = await db
      .update(invoices)
      .set({
        customer_id:
          body.customer_id !== undefined
            ? body.customer_id
            : existing[0].customer_id,
        amount: body.amount !== undefined ? body.amount : existing[0].amount,
        date: body.date !== undefined ? new Date(body.date) : existing[0].date,
        status: body.status !== undefined ? body.status : existing[0].status,
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, id))
      .returning();

    return c.json(result[0]);
  } catch (e) {
    return c.json({ error: (e as Error).message }, 500);
  }
});

// DELETE invoice
invoicesRoute.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    if (!id) {
      return c.json({ error: "Invalid invoice ID" }, 400);
    }

    const db = createDb(c.env.d1_vite_react);

    // Check if invoice exists
    const existing = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, id))
      .limit(1);

    if (existing.length === 0) {
      return c.json({ error: "Invoice not found" }, 404);
    }

    await db.delete(invoices).where(eq(invoices.id, id));

    return c.json({ message: "Invoice deleted successfully" });
  } catch (e) {
    return c.json({ error: (e as Error).message }, 500);
  }
});

export default invoicesRoute;
