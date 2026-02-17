"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignUpForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [handle, setHandle] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, handle: handle || undefined, name: name || undefined }),
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
      router.push("/");
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
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
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
      <Button type="submit" className="w-full" variant="performance" disabled={loading}>
        {loading ? "Creating account…" : "Create account"}
      </Button>
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
        onClick={() => signIn("google", { callbackUrl: "/" })}
      >
        Continue with Google
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/sign-in" className="font-medium text-foreground underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
