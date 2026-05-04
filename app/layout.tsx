import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Plus_Jakarta_Sans, Space_Grotesk, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { CarastaLayout } from "@/components/carasta/CarastaLayout";
import { Toaster } from "@/components/ui/toaster";
import { getPublicSiteOrigin } from "@/lib/marketing/site-origin";

const FeedbackWidget = dynamic(
  () => import("@/components/feedback/FeedbackWidget"),
  { ssr: false }
);

const CarastaAssistantChat = dynamic(
  () => import("@/components/assistant/CarastaAssistantChat").then((m) => ({ default: m.CarastaAssistantChat })),
  { ssr: false }
);

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getPublicSiteOrigin()),
  title: {
    default: "Carmunity by Carasta | Social-first automotive platform",
    template: "%s | Carmunity by Carasta",
  },
  description:
    "Carmunity by Carasta — connect with gearheads, browse discussions, show your garage, and bid on collector cars in one system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`carasta-theme ${plusJakarta.variable} ${spaceGrotesk.variable} ${playfair.variable} min-h-screen bg-background font-sans antialiased text-foreground`}
      >
        <Providers>
          <CarastaLayout>{children}</CarastaLayout>
          {/* Assistant chat panel + Feedback pill — bottom-right stack */}
          <div className="pointer-events-none fixed bottom-6 right-6 z-[70] flex flex-col gap-2">
            <div className="pointer-events-auto flex flex-col gap-2">
              <CarastaAssistantChat />
              <FeedbackWidget />
            </div>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
