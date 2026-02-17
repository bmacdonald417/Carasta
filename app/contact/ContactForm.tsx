"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export function ContactForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Something went wrong.");
      toast({ title: "Message sent", description: "We'll get back to you soon." });
      setForm({ firstName: "", lastName: "", email: "", message: "" });
    } catch (err) {
      toast({
        title: "Failed to send",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="mb-1 block text-xs font-medium text-carasta-white/80">
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            required
            value={form.firstName}
            onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
            className="w-full rounded-full border border-carasta-white/40 bg-transparent px-4 py-3 text-carasta-white placeholder:text-carasta-white/50 focus:border-carasta-white focus:outline-none focus:ring-1 focus:ring-carasta-white"
            placeholder="First name"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="mb-1 block text-xs font-medium text-carasta-white/80">
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            required
            value={form.lastName}
            onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
            className="w-full rounded-full border border-carasta-white/40 bg-transparent px-4 py-3 text-carasta-white placeholder:text-carasta-white/50 focus:border-carasta-white focus:outline-none focus:ring-1 focus:ring-carasta-white"
            placeholder="Last name"
          />
        </div>
      </div>
      <div>
        <label htmlFor="email" className="mb-1 block text-xs font-medium text-carasta-white/80">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          className="w-full rounded-full border border-carasta-white/40 bg-transparent px-4 py-3 text-carasta-white placeholder:text-carasta-white/50 focus:border-carasta-white focus:outline-none focus:ring-1 focus:ring-carasta-white"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label htmlFor="message" className="mb-1 block text-xs font-medium text-carasta-white/80">
          Message
        </label>
        <textarea
          id="message"
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
          className="w-full rounded-2xl border border-carasta-white/40 bg-transparent px-4 py-3 text-carasta-white placeholder:text-carasta-white/50 focus:border-carasta-white focus:outline-none focus:ring-1 focus:ring-carasta-white"
          placeholder="Your message..."
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-carasta-bg px-6 py-3 font-serif text-base font-medium text-carasta-ink transition-opacity hover:opacity-90 disabled:opacity-70"
      >
        {loading ? "Sending…" : "Send"}
      </button>
    </form>
  );
}
