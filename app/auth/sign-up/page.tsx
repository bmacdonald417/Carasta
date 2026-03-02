import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SignUpForm } from "./sign-up-form";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getSession();
  const sp = await searchParams;
  const callbackUrl = typeof sp.callbackUrl === "string" ? sp.callbackUrl : undefined;
  if (session) redirect(callbackUrl || "/");

  const googleEnabled = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-md flex-col justify-center px-4 py-12">
      <div className="space-y-6">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Create an account
        </h1>
        <p className="text-muted-foreground">
          Join the community. Bid on cars, build your garage, and connect with
          enthusiasts.
        </p>
        <SignUpForm googleEnabled={googleEnabled} callbackUrl={callbackUrl} />
      </div>
    </div>
  );
}
