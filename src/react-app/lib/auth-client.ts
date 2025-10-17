import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: import.meta.env.DEV
    ? "http://localhost:5173"
    : "https://vite-react-cfw.eci4ever.workers.dev",
  plugins: [adminClient()],
});
