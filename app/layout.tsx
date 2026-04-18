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
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
