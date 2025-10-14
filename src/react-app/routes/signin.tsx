import { createFileRoute } from "@tanstack/react-router";
import { SigninForm } from "@/components/signin-form";

export const Route = createFileRoute("/signin")({
  component: Signin,
});

function Signin() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SigninForm />
      </div>
    </div>
  );
}
