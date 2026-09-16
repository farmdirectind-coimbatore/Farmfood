import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1a2e1a",
};

export const metadata: Metadata = {
  title: {
    default: "FarmDirect - Fresh Farm Investment Platform",
    template: "%s | FarmDirect",
  },
  description: "Invest in a real working farm in Coimbatore. 1 share = ₹10,000. Earn 1% daily returns on weekdays for 249 days from real farm revenue — produce, livestock, Kerala restaurant and agro-tourism.",
  keywords: ["FarmDirect", "farm investment", "Coimbatore", "Tamil Nadu", "agro-tourism", "passive income", "farm revenue sharing", "Kerala restaurant"],
  authors: [{ name: "FarmDirect Team" }],
  icons: {
    icon: "/images/favicon.png",
  },
  openGraph: {
    title: "FarmDirect - Fresh Farm Investment Platform",
    description: "Own a piece of a working farm. Earn daily returns from real agricultural revenue.",
    url: "https://farmdirect.co.in",
    siteName: "FarmDirect",
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: "https://farmdirect.co.in/images/hero-farmland.png",
        width: 1200,
        height: 630,
        alt: "FarmDirect Farm Investment",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FarmDirect - Fresh Farm Investment Platform",
    description: "Own a piece of a working farm. Earn daily returns from real agricultural revenue.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${fraunces.variable}`}
    >
      <body className="antialiased bg-background text-foreground font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}