import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const fetchData = async () => {
    try {
      const response = await fetch("/api/customers");
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold underline mb-4">Hello World</h1>
      <Button onClick={fetchData}>Click me</Button>
    </div>
  );
}
