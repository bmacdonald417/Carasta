"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function SignUpForm({ googleEnabled = false, callbackUrl }: { googleEnabled?: boolean; callbackUrl?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [handle, setHandle] = useState("");
  const [name, setName] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptCommunityGuidelines, setAcceptCommunityGuidelines] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const consentComplete =
    acceptTerms && acceptPrivacy && acceptCommunityGuidelines;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!consentComplete) {
      setError("Please accept the Terms, Privacy Policy, and Community Guidelines.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          handle: handle || undefined,
          name: name || undefined,
          acceptTerms: true,
          acceptPrivacy: true,
          acceptCommunityGuidelines: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Something went wrong.");
        return;
      }
      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (signInRes?.error) {
        setError("Account created but sign-in failed. Try signing in.");
        return;
      }
      router.push(callbackUrl || "/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <p className="rounded-2xl border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="handle">Handle (optional)</Label>
        <Input
          id="handle"
          type="text"
          placeholder="e.g. trackdaytom"
          value={handle}
          onChange={(e) => setHandle(e.target.value.replace(/[^a-z0-9_]/gi, "").toLowerCase())}
        />
        <p className="text-xs text-muted-foreground">
          Letters, numbers, underscore. Your profile will be /u/{handle || "..."}.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Display name (optional)</Label>
        <Input
          id="name"
          type="text"
          placeholder="Tom"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <fieldset className="space-y-3 rounded-2xl border border-border/60 bg-card/40 p-4">
        <legend className="sr-only">Legal agreements</legend>
        <ConsentRow
          id="accept-terms"
          checked={acceptTerms}
          onCheckedChange={setAcceptTerms}
          label={
            <>
              I agree to the{" "}
              <Link
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                Terms of Service
              </Link>
              .
            </>
          }
        />
        <ConsentRow
          id="accept-privacy"
          checked={acceptPrivacy}
          onCheckedChange={setAcceptPrivacy}
          label={
            <>
              I agree to the{" "}
              <Link
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                Privacy Policy
              </Link>
              .
            </>
          }
        />
        <ConsentRow
          id="accept-community"
          checked={acceptCommunityGuidelines}
          onCheckedChange={setAcceptCommunityGuidelines}
          label={
            <>
              I agree to the{" "}
              <Link
                href="/community-guidelines"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                Community Guidelines
              </Link>
              .
            </>
          }
        />
      </fieldset>

      <Button
        type="submit"
        className="w-full"
        variant="performance"
        disabled={loading || !consentComplete}
      >
        {loading ? "Creating account…" : "Create account"}
      </Button>
      {googleEnabled && (
        <>
          <div className="relative my-4">
            <span className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </span>
            <span className="relative flex justify-center text-xs uppercase text-muted-foreground">
              Or
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={loading}
            onClick={() => signIn("google", { callbackUrl: callbackUrl || "/" })}
          >
            Continue with Google
          </Button>
          <p className="text-xs text-muted-foreground">
            Google sign-in may not record the same policy acknowledgments yet; we
            may prompt you separately in a future update.
          </p>
        </>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href={callbackUrl ? `/auth/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/auth/sign-in"}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}

function ConsentRow({
  id,
  checked,
  onCheckedChange,
  label,
}: {
  id: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  label: ReactNode;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-3 text-sm text-muted-foreground"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className={cn(
          "mt-0.5 h-4 w-4 shrink-0 rounded border border-input bg-background",
          "text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        )}
      />
      <span>{label}</span>
    </label>
  );
}
