import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "FarmDirect Daily Fresh Vegetables | Coimbatore Agri-Tech Startup",
  description: "Farm-fresh vegetables straight from local farmers to your door. Zero middlemen, peak freshness, fair pricing. Investment opportunities with 18% APY returns.",
  keywords: ["FarmDirect", "fresh vegetables", "Coimbatore", "Tamil Nadu", "agri-tech", "farm to table", "organic vegetables", "investment opportunity"],
  authors: [{ name: "FarmDirect Team" }],
  icons: {
    icon: "/images/processing.png",
  },
  openGraph: {
  title: "FarmDirect Daily Fresh Vegetables",
  description: "Farm-fresh vegetables straight from local farmers. Investment opportunities with 18% APY returns.",
  url: "https://farmdirect.co.in",
  siteName: "FarmDirect",
  type: "website",
  images: [
    {
      url: "https://farmdirect.co.in/images/processing.png",
      width: 1200,
      height: 630,
      alt: "FarmDirect Fresh Vegetables"
    }
  ]
},
  twitter: {
    card: "summary_large_image",
    title: "FarmDirect Daily Fresh Vegetables",
    description: "Farm-fresh vegetables straight from local farmers to your door.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
