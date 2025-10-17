import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users_table", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  age: int().notNull(),
  email: text().notNull().unique(),
});

// Better Auth tables
export const user = sqliteTable("user", {
  id: text().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: int({ mode: "boolean" }).notNull().default(false),
  image: text(),
  // Admin plugin fields
  role: text().default("user"),
  banned: int({ mode: "boolean" }).default(false),
  banReason: text(),
  banExpires: int({ mode: "timestamp" }),
  createdAt: int({ mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: int({ mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const session = sqliteTable("session", {
  id: text().primaryKey(),
  expiresAt: int({ mode: "timestamp" }).notNull(),
  token: text().notNull().unique(),
  // Admin plugin field
  impersonatedBy: text(),
  createdAt: int({ mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: int({ mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  ipAddress: text(),
  userAgent: text(),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text().primaryKey(),
  accountId: text().notNull(),
  providerId: text().notNull(),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text(),
  refreshToken: text(),
  idToken: text(),
  accessTokenExpiresAt: int({ mode: "timestamp" }),
  refreshTokenExpiresAt: int({ mode: "timestamp" }),
  scope: text(),
  password: text(),
  createdAt: int({ mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: int({ mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const verification = sqliteTable("verification", {
  id: text().primaryKey(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: int({ mode: "timestamp" }).notNull(),
  createdAt: int({ mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: int({ mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});
