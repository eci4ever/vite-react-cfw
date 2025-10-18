import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin as adminPlugin } from "better-auth/plugins";
import { createDb } from "../db/db";

let authInstance: ReturnType<typeof betterAuth> | null = null;

export function getAuthInstance(
  env: { d1_vite_react: D1Database; BETTER_AUTH_SECRET: string },
  baseURL: string
) {
  if (!authInstance) {
    const db = createDb(env.d1_vite_react);

    authInstance = betterAuth({
      database: drizzleAdapter(db, {
        provider: "sqlite",
      }),
      emailAndPassword: {
        enabled: true,
      },
      user: {
        additionalFields: {
          role: {
            type: "string",
            defaultValue: "user",
            required: true,
          },
        },
      },
      plugins: [
        adminPlugin({
          adminRoles: ["admin"],
        }),
      ],
      trustedOrigins: [baseURL],
      baseURL: baseURL,
      secret: env.BETTER_AUTH_SECRET || "your-secret-key-change-in-production",
    });
  }

  return authInstance;
}

// Function to reset the auth instance (useful for testing or when environment changes)
export function resetAuthInstance() {
  authInstance = null;
}
