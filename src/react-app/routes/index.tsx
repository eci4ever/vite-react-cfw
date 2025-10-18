import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/hero";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const session = Route.useLoaderData();
  console.log("session", session);
  return <Hero />;
}
