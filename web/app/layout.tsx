import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK"],
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://anotely.app"),
  title: {
    default: "Anotely — notes that listen back",
    template: "%s · Anotely",
  },
  description:
    "A notes app you can talk to. Anotely transcribes voice notes, titles them, pulls out action items, and finds them again by meaning.",
  keywords: [
    "voice notes",
    "note taking app",
    "speech to text",
    "ai notes",
    "semantic search",
    "Anotely",
  ],
  authors: [{ name: "Anotely" }],
  openGraph: {
    type: "website",
    url: "https://anotely.app",
    siteName: "Anotely",
    title: "Anotely — notes that listen back",
    description:
      "Talk or type. Anotely writes it down, titles it, files it, and finds it later.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anotely — notes that listen back",
    description: "Talk or type. Anotely writes it down, titles it, files it, and finds it later.",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#FAF7F0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-paper text-ink antialiased">{children}</body>
    </html>
  );
}
