/**
 * How It Works section content. Shared between timeline and any anchors.
 */
import type { LucideIcon } from "lucide-react";
import {
  Search,
  Gavel,
  Shield,
  Clock,
  CreditCard,
  Truck,
} from "lucide-react";

export const HOW_IT_WORKS_SECTIONS: {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    id: "discover",
    icon: Search,
    title: "Discover & Watchlist",
    description:
      "Browse live auctions filtered by make, model, year, and condition. Each listing includes detailed condition reports, high-resolution photos, and seller profiles. Save cars you love to your Garage—your personal collection of owned and dream vehicles—so you can track them and bid when you're ready.",
  },
  {
    id: "bid",
    icon: Gavel,
    title: "Bidding Basics",
    description:
      "Place bids in real time. The minimum bid increment is $250—each new bid must be at least $250 higher than the current high bid. Set an auto-bid with your maximum amount and we'll bid in $250 steps for you until your cap is reached, so you can stay in the race without constant monitoring.",
  },
  {
    id: "reserve",
    icon: Shield,
    title: "Reserve Prices",
    description:
      "Sellers can set a hidden reserve—the minimum price they'll accept. You won't see the exact number, but the reserve meter shows how close the high bid is to meeting it (0–100%). When the meter hits 100%, the reserve is met and the car will sell to the highest bidder when the auction ends. No reserve means the car sells to the top bid regardless of amount.",
  },
  {
    id: "anti-sniping",
    icon: Clock,
    title: "Anti-Sniping",
    description:
      "Last-second bids can feel unfair. Our anti-sniping system extends the auction clock by 2 minutes whenever a new bid is placed in the final 2 minutes. That gives everyone a fair chance to respond—no more losing to a snipe in the last second.",
  },
  {
    id: "winning",
    icon: CreditCard,
    title: "Winning, Payment & Next Steps",
    description:
      "When you win, you'll receive confirmation and next-step instructions. Payment and delivery coordination are handled through Carasta. We connect buyer and seller to complete the transaction and ensure a smooth handoff.",
  },
  {
    id: "shipping",
    icon: Truck,
    title: "Shipping & Handoff",
    description:
      "Coordinate pickup or shipping directly with the seller. You'll receive title, bill of sale, and condition documentation. We support the full handoff so you drive away—or ship away—with confidence and proper paperwork.",
  },
];
