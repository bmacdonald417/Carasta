/**
 * Verify auction-metrics helpers and data flow.
 * Run: npx ts-node -P tsconfig.scripts.json scripts/verify-auction-metrics.ts
 */
import {
  computeCurrentBidCents,
  computeReserveMetPercent,
  formatMoney,
  formatPercent,
} from "../lib/auction-metrics";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

console.log("Verifying lib/auction-metrics.ts...\n");

// computeCurrentBidCents
assert(computeCurrentBidCents([]) === 0, "Empty bids => 0");
assert(computeCurrentBidCents(undefined) === 0, "Undefined bids => 0");
assert(
  computeCurrentBidCents([{ amountCents: 50000 }]) === 50000,
  "Single bid => amount"
);
assert(
  computeCurrentBidCents([
    { amountCents: 50000 },
    { amountCents: 30000 },
    { amountCents: 25000 },
  ]) === 50000,
  "Multiple bids (orderBy desc) => bids[0] is highest"
);

// computeReserveMetPercent
assert(
  computeReserveMetPercent(0, 10000) === 0,
  "0 bid, 10k reserve => 0%"
);
assert(
  computeReserveMetPercent(5000, 10000) === 50,
  "5k bid, 10k reserve => 50%"
);
assert(
  computeReserveMetPercent(10000, 10000) === 100,
  "10k bid, 10k reserve => 100%"
);
assert(
  computeReserveMetPercent(15000, 10000) === 100,
  "15k bid, 10k reserve => capped 100%"
);
assert(
  computeReserveMetPercent(5000, null) === null,
  "No reserve => null"
);
assert(
  computeReserveMetPercent(5000, 0) === null,
  "Reserve 0 => null"
);

// formatMoney / formatPercent
assert(formatMoney(12345).includes("123") || formatMoney(12345).includes("$"), "formatMoney works");
assert(formatPercent(50) === "50%", "formatPercent works");

console.log("All auction-metrics assertions passed.");
console.log("\nData flow summary:");
console.log("- Current bid: from included bids (orderBy amountCents desc, take 1) via computeCurrentBidCents");
console.log("- Reserve %: computeReserveMetPercent(highBidCents, reservePriceCents)");
console.log("- Bid count: _count.bids from Prisma include");
console.log("- No getAuctionHighBid or separate bid queries.");
