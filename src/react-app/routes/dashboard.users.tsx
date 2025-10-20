import { createFileRoute, redirect } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/dashboard/users")({
  loader: async () => {
    const { data: session } = await authClient.getSession();
    if (!session || session.user.role !== "admin") {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/dashboard/users"!</div>;
}
