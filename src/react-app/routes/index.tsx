import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold underline mb-4">Hello World</h1>
      <Button>Click me</Button>
    </div>
  );
}
