import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Database, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">User Management System</h1>
        <p className="text-xl text-gray-600 mb-8">
          Built with React, TanStack Router, and Cloudflare Workers
        </p>
        <Link to="/users">
          <Button size="lg" className="text-lg px-8 py-3">
            <Users className="h-5 w-5 mr-2" />
            Manage Users
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User CRUD
            </CardTitle>
            <CardDescription>
              Full Create, Read, Update, Delete operations for user data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Add new users</li>
              <li>• View user list</li>
              <li>• Edit user details</li>
              <li>• Delete users</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Drizzle ORM
            </CardTitle>
            <CardDescription>
              Type-safe database operations with Drizzle ORM
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Type-safe queries</li>
              <li>• SQLite database</li>
              <li>• Schema validation</li>
              <li>• Cloudflare D1</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Modern Stack
            </CardTitle>
            <CardDescription>
              Built with the latest React and web technologies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• React 19</li>
              <li>• TanStack Router</li>
              <li>• React Query</li>
              <li>• Tailwind CSS</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-500">
          Click "Manage Users" to start working with the user database
        </p>
      </div>
    </div>
  );
}
