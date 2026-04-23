import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Inter, Oswald, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { CarastaAssistantLauncher } from "@/components/assistant/carasta-assistant-launcher";
import { CarastaLayout } from "@/components/carasta/CarastaLayout";
import { Toaster } from "@/components/ui/toaster";
import { getPublicSiteOrigin } from "@/lib/marketing/site-origin";

const FeedbackWidget = dynamic(
  () => import("@/components/feedback/FeedbackWidget"),
  { ssr: false }
);

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
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
        className={`carasta-theme ${inter.variable} ${oswald.variable} ${playfair.variable} min-h-screen bg-background font-sans antialiased text-foreground`}
      >
        <Providers>
          <CarastaLayout>{children}</CarastaLayout>
          {/* Assistant above, Feedback below — shared pill stack, bottom-right */}
          <div className="pointer-events-none fixed bottom-6 right-6 z-[70] flex flex-col gap-2">
            <div className="pointer-events-auto flex flex-col gap-2">
              <CarastaAssistantLauncher />
              <FeedbackWidget />
            </div>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
