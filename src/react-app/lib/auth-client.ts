import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.DEV
    ? "http://localhost:5173"
    : "https://vite-react-cfw.eci4ever.workers.dev",
});
