import type { Metadata } from "next";
import { Inter, Oswald, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { CarastaLayout } from "@/components/carasta/CarastaLayout";
import { Toaster } from "@/components/ui/toaster";

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
  title: "Carasta | Premium Collector Car Auctions",
  description:
    "Bid on exceptional collector cars. Join the community of enthusiasts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${oswald.variable} ${playfair.variable} min-h-screen font-sans antialiased`}
      >
        <Providers>
          <CarastaLayout>{children}</CarastaLayout>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
