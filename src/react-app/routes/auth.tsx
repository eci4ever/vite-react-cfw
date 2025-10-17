import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoginForm, RegisterForm } from "@/components/auth-forms";
import { LogOut, User } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/auth")({
  component: Auth,
});

interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
}

function Auth() {
  const [isLogin, setIsLogin] = useState(true);

  // Check if user is already logged in
  const { data: session, isPending } = authClient.useSession();

  const handleAuthSuccess = () => {
    // Refresh the page to update the session
    window.location.reload();
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.reload();
  };

  if (isPending) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (session) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-2xl font-bold">
            <User className="h-8 w-8" />
            Welcome, {session.user.name}!
          </div>
          <div className="text-gray-600">Email: {session.user.email}</div>
          <div className="text-sm text-gray-500">
            Email Verified: {session.user.emailVerified ? "Yes" : "No"}
          </div>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md">
        {isLogin ? (
          <LoginForm onSuccess={handleAuthSuccess} />
        ) : (
          <RegisterForm onSuccess={handleAuthSuccess} />
        )}

        <div className="mt-4 text-center">
          <Button
            variant="link"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </Button>
        </div>
      </div>
    </div>
  );
}
