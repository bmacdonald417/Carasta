import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SignInForm } from "./sign-in-form";

export default async function SignInPage() {
  const session = await getSession();
  if (session) redirect("/");

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-md flex-col justify-center px-4 py-12">
      <div className="space-y-6">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Welcome back
        </h1>
        <p className="text-muted-foreground">
          Sign in to your account to bid, sell, and connect with the community.
        </p>
        <SignInForm />
      </div>
    </div>
  );
}
