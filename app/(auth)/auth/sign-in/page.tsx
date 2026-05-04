import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignInForm } from "./sign-in-form";

export default async function SignInPage() {
  const session = await getSession();
  if (session) redirect("/");

  const googleEnabled = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col lg:flex-row">
      {/* Left panel — brand */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[hsl(var(--navy))] p-10 lg:flex lg:w-[44%] xl:w-[40%]">
        {/* Decorative background */}
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
          <blockquote className="space-y-3">
            <p className="text-2xl font-semibold leading-snug text-white xl:text-3xl">
              The social‑first platform for collector car enthusiasts.
            </p>
            <p className="text-sm leading-relaxed text-white/70">
              Bid on collector cars, build your garage, connect with enthusiasts, and manage auctions — all in one place.
            </p>
          </blockquote>

          <div className="grid grid-cols-3 gap-3">
            {[
              { val: "47", lbl: "Live auctions" },
              { val: "1.2K", lbl: "Members online" },
              { val: "$2.4M", lbl: "In bids today" },
            ].map(({ val, lbl }) => (
              <div
                key={lbl}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-center backdrop-blur-sm"
              >
                <p className="text-lg font-bold text-white">{val}</p>
                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-white/60">
                  {lbl}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-white/40">
          © {new Date().getFullYear()} Carasta. All rights reserved.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-10 xl:px-16">
        <div className="w-full max-w-md space-y-7">
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
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Sign in to bid, sell, join Carmunity, and connect with other enthusiasts.
            </p>
          </div>

          <SignInForm googleEnabled={googleEnabled} />

          <p className="text-center text-xs text-muted-foreground">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-foreground">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
