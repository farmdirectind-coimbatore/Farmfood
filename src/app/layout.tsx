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
  metadataBase: new URL("https://farmdirect.co.in"),
  title: {
    default: "FarmDirect | Agriculture & Aagritech",
    template: "%s",
  },
  description: "FarmDirect connects people with real agricultural operations in Coimbatore including crop cultivation, livestock, farming, fresh farm produce, wholesale distribution and agro-tourism.",
  keywords: ["FarmDirect", "agriculture", "agritech", "agri-tech", "Coimbatore", "Tamil Nadu", "crop cultivation", "livestock", "fresh farm produce", "wholesale distribution", "agro-tourism", "working farm"],
  authors: [{ name: "FarmDirect Team" }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://farmdirect.co.in",
  },
  icons: {
    icon: "/images/favicon.png",
  },
  openGraph: {
    title: "FarmDirect | Agriculture & Aagritech",
    description: "FarmDirect connects people with real agricultural operations in Coimbatore including crop cultivation, livestock, farming, fresh farm produce, wholesale distribution and agro-tourism.",
    url: "https://farmdirect.co.in",
    siteName: "FarmDirect",
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: "https://farmdirect.co.in/images/hero-farmland.png",
        width: 1200,
        height: 630,
        alt: "FarmDirect - real agriculture and agritech in Coimbatore",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FarmDirect | Agriculture & Aagritech",
    description: "FarmDirect connects people with real agricultural operations in Coimbatore including crop cultivation, livestock, farming, fresh farm produce, wholesale distribution and agro-tourism.",
    images: ["https://farmdirect.co.in/images/hero-farmland.png"],
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