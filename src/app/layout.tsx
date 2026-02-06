import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google"; // Using the intended fonts
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-display", // Matches our globals.css variable
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#020617", // Matches dark mode background
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://kideepdive.strategenwerk.com"),
  title: {
    template: "%s | Momo AI Deep Dive",
    default: "Momo AI Deep Dive | KI Workshops Salzburg",
  },
  description: "Der monatliche Deep Dive in AI Skills, Coding & Automation. Vom Tool zum Alleskönner. Jeden 1. Montag im Monat im Penthouse Salzburg.",
  keywords: ["KI", "AI", "Salzburg", "Workshop", "Coding", "Automation", "Momo Feichtinger", "Deep Dive", "Cursor", "RAG", "LLM", "Generative AI"],
  authors: [{ name: "Momo Feichtinger", url: "https://strategenwerk.com" }],
  creator: "Momo Feichtinger",
  publisher: "Strategenwerk",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "de_AT",
    url: "https://kideepdive.strategenwerk.com",
    title: "Momo AI Deep Dive | KI Workshops Salzburg",
    description: "Der monatliche Deep Dive in AI Skills, Coding & Automation. Vom Tool zum Alleskönner.",
    siteName: "Momo AI Deep Dive",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Momo AI Deep Dive Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Momo AI Deep Dive",
    description: "KI Skills & Automation Workshops in Salzburg.",
    images: ["/logo.png"],
    creator: "@momofeichtinger",
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.json",
};

import { FeedbackWidget } from "@/components/feedback/FeedbackWidget";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="scroll-smooth">
      <body
        className={`${inter.variable} ${outfit.variable} antialiased`}
      >
        {children}
        <FeedbackWidget />
      </body>
    </html>
  );
}
