import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
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
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col lg:flex-row">
      {/* Left panel — brand */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[hsl(var(--navy))] p-10 lg:flex lg:w-[44%] xl:w-[40%]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, hsl(var(--primary)) 0%, transparent 60%), radial-gradient(circle at 80% 20%, hsl(var(--primary)) 0%, transparent 50%)",
          }}
        />
        <div className="relative">
          <Link href="/" className="inline-flex items-center gap-3">
            <img
              src="/brand/carasta/logo-circle.png"
              alt="Carasta"
              className="h-9 w-9 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <span className="carasta-marketing-display text-lg font-semibold tracking-[0.14em] text-white">
              Carmunity
            </span>
          </Link>
        </div>

        <div className="relative space-y-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold leading-snug text-white xl:text-3xl">
              Join a community built around cars.
            </h2>
            <p className="text-sm leading-relaxed text-white/70">
              Create your garage, follow auctions, join Discussions, and connect with buyers and sellers who share your passion.
            </p>
          </div>
          <ul className="space-y-3">
            {[
              "Bid on live collector car auctions",
              "Build and share your garage",
              "Join Carmunity — feed, forums, and messaging",
              "Sell with AI-powered marketing tools",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-white/80">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/30 text-[10px] font-bold text-white">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/40">
          © {new Date().getFullYear()} Carasta. All rights reserved.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:overflow-y-auto lg:px-10 xl:px-16">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <img
              src="/brand/carasta/logo-circle.png"
              alt="Carasta"
              className="h-8 w-8 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <span className="carasta-marketing-display text-base font-semibold tracking-[0.14em] text-foreground">
              Carmunity
            </span>
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Create an account
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Join Carmunity by Carasta — bid on cars, build your garage, join discussions, and connect with enthusiasts.
            </p>
          </div>

          <SignUpForm googleEnabled={googleEnabled} callbackUrl={callbackUrl} />
        </div>
      </div>
    </div>
  );
}
