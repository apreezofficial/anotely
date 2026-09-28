import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://anotely.app"),
  title: {
    default: "Anotely — talk, and it writes. Say done, and AI polishes it.",
    template: "%s · Anotely",
  },
  description:
    "The voice-first notes app. Dictate naturally with Auto Write, say “anotely done”, and an AI proofreads the whole note before you apply a single change.",
  keywords: [
    "voice notes",
    "dictation app",
    "ai proofreading",
    "speech to text",
    "Anotely",
    "auto write",
  ],
  authors: [{ name: "Anotely" }],
  openGraph: {
    type: "website",
    url: "https://anotely.app",
    siteName: "Anotely",
    title: "Anotely — speak, and it writes. AI polishes it.",
    description:
      "Voice-first notes. Auto Write turns speech into clean text; say “done” and AI proofreads everything.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anotely — talk, and it writes.",
    description: "Voice-first notes with AI proofreading the moment you say done.",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#06060a",
  width: "device-width",
  initialScale: 1,
};

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Anotely",
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Windows, macOS, Linux, iOS, Android",
  description:
    "Voice-first notes with automatic transcription and AI proofreading triggered by voice.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
