import { createRootRoute, Outlet, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Home, Users, LogIn, LogOut, User } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export const Route = createRootRoute({
  loader: async () => {
    const { data: session } = await authClient.getSession();
    return session;
  },
  component: Root,
});

interface User {
  id: string;
  name: string;
  email: string;
}

function Root() {
  const session = Route.useLoaderData();

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-xl font-bold text-gray-900">
              User Management
            </Link>
            <div className="flex gap-2">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
              {session && (
                <Link to="/users">
                  <Button variant="ghost" size="sm">
                    <Users className="h-4 w-4 mr-2" />
                    Users
                  </Button>
                </Link>
              )}
              {session ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    <User className="h-4 w-4 inline mr-1" />
                    <Link to="/auth">{session.user.name}</Link>
                  </span>
                  <Button variant="ghost" size="sm" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Link to="/auth">
                  <Button variant="ghost" size="sm">
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
