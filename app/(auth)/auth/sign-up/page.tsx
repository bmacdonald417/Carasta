import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Car, Gavel, MessageSquare, Sparkles } from "lucide-react";
import { safeCallbackPathOptional } from "@/lib/safe-callback-path";
import { SignUpForm } from "./sign-up-form";

const FEATURES = [
  {
    icon: Gavel,
    title: "Live collector car auctions",
    desc: "Bid on verified, enthusiast-curated listings with transparent reserve tracking.",
  },
  {
    icon: Car,
    title: "Your Garage & Dream List",
    desc: "Showcase what you own and what you're hunting — one identity across the platform.",
  },
  {
    icon: MessageSquare,
    title: "Gear-organized Discussions",
    desc: "Thread-based forums built around the cars you care about most.",
  },
  {
    icon: Sparkles,
    title: "AI-powered seller tools",
    desc: "Marketing copilot, listing AI, and channel playbooks — all in one workspace.",
  },
];

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getSession();
  const sp = await searchParams;
  const rawCallback =
    typeof sp.callbackUrl === "string" ? sp.callbackUrl : undefined;
  const callbackUrl = safeCallbackPathOptional(rawCallback);
  if (session) redirect(callbackUrl ?? "/");

  const googleEnabled = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col lg:flex-row">
      {/* ── Left panel — brand showcase ─────────────────────── */}
      <div className="relative hidden flex-col overflow-hidden bg-[hsl(var(--navy))] lg:flex lg:w-[46%] xl:w-[42%]">
        {/* Radial glows */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 10% 60%, hsl(var(--primary)/0.18) 0%, transparent 55%), radial-gradient(ellipse at 90% 10%, hsl(var(--primary)/0.12) 0%, transparent 50%)",
          }}
        />

        {/* Top — logo */}
        <div className="relative px-10 pt-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <img
              src="/brand/carasta/logo-circle.png"
              alt="Carasta"
              className="h-10 w-10 object-contain transition-transform group-hover:scale-105"
            />
            <span className="flex flex-col leading-none">
              <span className="carasta-marketing-display text-lg font-semibold tracking-[0.14em] text-white">
                Carmunity
              </span>
              <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/50">
                by Carasta
              </span>
            </span>
          </Link>
        </div>

        {/* Middle — headline + features */}
        <div className="relative flex flex-1 flex-col justify-center px-10 py-10">
          <div className="mb-8">
            <h2 className="text-3xl font-bold leading-tight text-white xl:text-4xl">
              Built for people who{" "}
              <span className="text-primary/90">live and breathe</span> cars.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              Join thousands of enthusiasts on the platform that connects buyers, sellers, collectors, and gearheads.
            </p>
          </div>

          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-primary/15 backdrop-blur-sm">
                  <Icon className="h-4 w-4 text-primary/90" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-white/55">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom — social proof pill */}
        <div className="relative border-t border-white/8 px-10 py-6">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {["bg-primary/40", "bg-primary/60", "bg-primary/80"].map((c, i) => (
                <div
                  key={i}
                  className={`h-7 w-7 rounded-full border-2 border-[hsl(var(--navy))] ${c}`}
                />
              ))}
            </div>
            <p className="text-xs text-white/55">
              Join the community of enthusiasts — it&apos;s free.
            </p>
          </div>
        </div>
      </div>

      {/* ── Right panel — form ───────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-start overflow-y-auto px-6 py-10 lg:px-10 xl:px-16">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <img
              src="/brand/carasta/logo-circle.png"
              alt="Carasta"
              className="h-8 w-8 object-contain"
            />
            <span className="carasta-marketing-display text-base font-semibold tracking-[0.14em] text-foreground">
              Carmunity
            </span>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Create your account
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Free to join. Takes less than a minute.
            </p>
          </div>

          {/* 3-step indicator */}
          <div className="mb-7 flex items-center gap-2">
            {["Account details", "Your identity", "Agreements"].map((label, i) => (
              <div key={label} className="flex flex-1 flex-col items-center">
                <div className="flex w-full items-center">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {i + 1}
                  </div>
                  {i < 2 && (
                    <div className="flex-1 border-t border-dashed border-border/60" />
                  )}
                </div>
                <p className="mt-1 text-[10px] font-medium text-muted-foreground/70 text-center">
                  {label}
                </p>
              </div>
            ))}
          </div>

          <SignUpForm googleEnabled={googleEnabled} callbackUrl={callbackUrl} />

          {/* Already a member */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href={
                callbackUrl != null
                  ? `/auth/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`
                  : "/auth/sign-in"
              }
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>

          {/* Legal footnote */}
          <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground/60">
            By creating an account you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-2 hover:text-muted-foreground">
              Terms
            </Link>
            ,{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-muted-foreground">
              Privacy Policy
            </Link>
            , and{" "}
            <Link href="/community-guidelines" className="underline underline-offset-2 hover:text-muted-foreground">
              Community Guidelines
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
