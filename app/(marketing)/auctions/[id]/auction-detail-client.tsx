"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Pusher from "pusher-js";
import { CountdownTimer } from "@/components/auction/CountdownTimer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, nextMinBidCents } from "@/lib/utils";
import { placeBid, quickBid, executeBuyNow, setAutoBid } from "../actions";
import { useToast } from "@/components/ui/use-toast";

const POLL_INTERVAL_MS = 4000;

type LiveData = {
  highBidCents: number;
  highBidderHandle: string | null;
  endAt: string;
  status: string;
  reserveMeterPercent: number | null;
  buyNowPriceCents: number | null;
  buyNowExpiresAt: string | null;
  bidCount: number;
};

export function AuctionDetailClient({
  auctionId,
  status,
  endAt,
  highBidCents: initialHighBidCents,
  highBidderHandle: initialHighBidderHandle,
  reserveMeterPercent: initialReservePercent,
  hasReserve,
  buyNowPriceCents: initialBuyNowCents,
  buyNowExpiresAt: initialBuyNowExpires,
  nextMinBidCents: initialNextMin,
  isLoggedIn,
  currentUserHandle,
}: {
  auctionId: string;
  status: string;
  endAt: string;
  highBidCents: number;
  highBidderHandle: string | null;
  reserveMeterPercent: number | null;
  hasReserve: boolean;
  buyNowPriceCents: number | null;
  buyNowExpiresAt: string | null;
  nextMinBidCents: number;
  isLoggedIn: boolean;
  currentUserHandle: string | null;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [live, setLive] = useState<LiveData>({
    highBidCents: initialHighBidCents,
    highBidderHandle: initialHighBidderHandle,
    endAt,
    status,
    reserveMeterPercent: initialReservePercent,
    buyNowPriceCents: initialBuyNowCents,
    buyNowExpiresAt: initialBuyNowExpires,
    bidCount: 0,
  });
  const [customAmount, setCustomAmount] = useState("");
  const [autoBidMax, setAutoBidMax] = useState("");
  const [loading, setLoading] = useState(false);

  // Real-time bid updates via Pusher (when configured)
  useEffect(() => {
    if (status !== "LIVE" || !process.env.NEXT_PUBLIC_PUSHER_KEY) return;
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "us2";
    const pusher = new Pusher(key, { cluster });
    const channel = pusher.subscribe(`auction-${auctionId}`);
    channel.bind("bid-update", (data: Partial<LiveData>) => {
      setLive((prev) => ({ ...prev, ...data }));
    });
    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`auction-${auctionId}`);
    };
  }, [auctionId, status]);

  useEffect(() => {
    if (status !== "LIVE") return;
    const fetchLive = async () => {
      try {
        const res = await fetch(`/api/auctions/${auctionId}`);
        if (!res.ok) return;
        const data = await res.json();
        setLive({
          highBidCents: data.highBidCents,
          highBidderHandle: data.highBidderHandle,
          endAt: data.endAt,
          status: data.status,
          reserveMeterPercent: data.reserveMeterPercent,
          buyNowPriceCents: data.buyNowPriceCents,
          buyNowExpiresAt: data.buyNowExpiresAt,
          bidCount: data.bidCount,
        });
      } catch (_) {}
    };
    fetchLive();
    const interval = setInterval(fetchLive, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [auctionId, status]);

  const nextMin = nextMinBidCents(live.highBidCents);
  const isEnded = live.status !== "LIVE";
  const canBuyNow =
    live.status === "LIVE" &&
    live.buyNowPriceCents != null &&
    live.buyNowExpiresAt != null &&
    new Date() < new Date(live.buyNowExpiresAt);

  const signUpHref = `/auth/sign-up?callbackUrl=${encodeURIComponent(`/auctions/${auctionId}`)}`;
  const signInHref = `/auth/sign-in?callbackUrl=${encodeURIComponent(`/auctions/${auctionId}`)}`;

  async function handleQuickBid() {
    if (!isLoggedIn) {
      router.push(signInHref);
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.set("auctionId", auctionId);
    formData.set("currentHighCents", String(live.highBidCents));
    const result = await quickBid(formData);
    setLoading(false);
    if (result.ok) {
      toast({ title: "Bid placed", description: formatCurrency(nextMin) });
      router.refresh();
    } else {
      toast({ title: "Bid failed", description: result.error, variant: "destructive" });
    }
  }

  async function handleCustomBid() {
    if (!isLoggedIn) {
      router.push(signInHref);
      return;
    }
    const cents = Math.round(parseFloat(customAmount) * 100);
    if (isNaN(cents) || cents < nextMin) {
      toast({
        title: "Invalid amount",
        description: `Minimum bid is ${formatCurrency(nextMin)}`,
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.set("auctionId", auctionId);
    formData.set("amountCents", String(cents));
    const result = await placeBid(formData);
    setLoading(false);
    if (result.ok) {
      toast({ title: "Bid placed", description: formatCurrency(cents) });
      setCustomAmount("");
      router.refresh();
    } else {
      toast({ title: "Bid failed", description: result.error, variant: "destructive" });
    }
  }

  async function handleBuyNow() {
    if (!isLoggedIn) {
      router.push(signInHref);
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.set("auctionId", auctionId);
    const result = await executeBuyNow(formData);
    setLoading(false);
    if (result.ok) {
      toast({ title: "Purchase complete", description: "Auction closed." });
      router.refresh();
    } else {
      toast({ title: "Purchase failed", description: result.error, variant: "destructive" });
    }
  }

  async function handleSetAutoBid() {
    if (!isLoggedIn) {
      router.push(signInHref);
      return;
    }
    const maxCents = Math.round(parseFloat(autoBidMax) * 100);
    if (isNaN(maxCents) || maxCents <= live.highBidCents) {
      toast({
        title: "Invalid max",
        description: "Max must be higher than current high bid.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.set("auctionId", auctionId);
    formData.set("maxAmountCents", String(maxCents));
    const result = await setAutoBid(formData);
    setLoading(false);
    if (result.ok) {
      toast({ title: "Auto-bid set", description: `Up to ${formatCurrency(maxCents)}` });
      setAutoBidMax("");
      router.refresh();
    } else {
      toast({ title: "Failed", description: result.error, variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6 rounded-2xl border border-border/50 bg-card/80 p-6">
      <div>
        <p className="text-sm text-muted-foreground">High bid</p>
        <p className="font-display text-3xl font-bold text-[hsl(var(--performance-red))]">
          {formatCurrency(live.highBidCents)}
        </p>
        {live.highBidderHandle && (
          <p className="text-sm text-muted-foreground">
            @{live.highBidderHandle}
          </p>
        )}
      </div>

      <div>
        <p className="text-sm text-muted-foreground">Time remaining</p>
        <CountdownTimer
          endAt={live.endAt}
          className="font-display text-xl font-semibold"
        />
      </div>

      {hasReserve ? (
        <div>
          <p className="mb-2 text-sm text-muted-foreground">Reserve meter</p>
          <Progress value={live.reserveMeterPercent ?? 0} className="h-3" />
          <p className="mt-1 text-xs text-muted-foreground">
            {live.reserveMeterPercent != null && live.reserveMeterPercent >= 100
              ? "Reserve met"
              : `${live.reserveMeterPercent ?? 0}%`}
          </p>
        </div>
      ) : (
        <p className="rounded-xl bg-muted/50 px-3 py-2 text-sm font-medium text-[hsl(var(--reserve-emerald))]">
          No Reserve
        </p>
      )}

      {!isEnded && (
        <>
          {!isLoggedIn ? (
            <div className="space-y-4 rounded-xl border border-border/50 bg-muted/30 p-4">
              <Button asChild variant="performance" size="lg" className="w-full">
                <Link href={signUpHref}>Sign up to bid</Link>
              </Button>
              <details className="group">
                <summary className="cursor-pointer text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground">
                  Why register?
                </summary>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                  <li>Place real-time bids + AutoBid</li>
                  <li>Track bids & alerts</li>
                  <li>Save vehicles to Garage</li>
                </ul>
              </details>
              <Link
                href="/how-it-works"
                className="block text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
              >
                Learn how bidding works
              </Link>
            </div>
          ) : (
          <>
          <div className="flex flex-col gap-2">
            <Button
              variant="performance"
              size="lg"
              className="w-full"
              disabled={loading}
              onClick={handleQuickBid}
            >
              Bid {formatCurrency(nextMin)}
            </Button>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Custom amount ($)"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                min={nextMin / 100}
                step={250}
              />
              <Button
                variant="outline"
                onClick={handleCustomBid}
                disabled={loading}
              >
                Bid
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Auto-bid (max amount)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Max bid ($)"
                value={autoBidMax}
                onChange={(e) => setAutoBidMax(e.target.value)}
                min={nextMin / 100}
                step={250}
              />
              <Button
                variant="secondary"
                onClick={handleSetAutoBid}
                disabled={loading}
              >
                Set
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              We&apos;ll bid in $250 steps until your max.
            </p>
          </div>

          {canBuyNow && live.buyNowPriceCents != null && (
            <Button
              variant="emerald"
              size="lg"
              className="w-full"
              disabled={loading}
              onClick={handleBuyNow}
            >
              Buy now — {formatCurrency(live.buyNowPriceCents)}
            </Button>
          )}
          </>
          )}
        </>
      )}

      {isEnded && (
        <p className="rounded-xl bg-muted/50 px-3 py-2 text-sm font-medium">
          {status === "SOLD" ? "Sold" : "Auction ended"}
        </p>
      )}
    </div>
  );
}
